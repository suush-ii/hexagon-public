import { db } from '$lib/server/db'
import {
	assetTable,
	inventoryTable,
	outfitsTable,
	transactionsTable,
	usersTable
} from '$lib/server/schema'
import { auth } from '$src/lib/server/lucia'
import { type RequestHandler, error, json } from '@sveltejs/kit'
import { eq, and, ne } from 'drizzle-orm'
import { LuciaError } from 'lucia'
import { z } from 'zod'

export const POST: RequestHandler = async ({ url, locals, cookies }) => {
	const result = await z.coerce
		.number()
		.int()
		.positive()
		.safeParseAsync(url.searchParams.get('productId'))

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const authBearer = cookies.get('.ROBLOSECURITY') ?? ''

	let user: any

	try {
		const sessionVal = await auth.validateSession(authBearer)

		if (sessionVal) {
			user = sessionVal.user
		} else {
			return error(403, {
				success: false,
				message: 'Invalid session.',
				data: {}
			})
		}
	} catch (e) {
		if (e instanceof LuciaError && e.message === `AUTH_INVALID_SESSION_ID`) {
			// invalid session
			return error(403, {
				success: false,
				message: 'Invalid session.',
				data: {}
			})
		}
	}

	const assetId = result.data

	const item = await db.query.assetTable.findFirst({
		where: and(eq(assetTable.assetid, assetId), ne(assetTable.assetType, 'games')),
		columns: {
			price: true,
			moderationstate: true,
			sales: true,
			assetType: true,
			onsale: true,
			last7dayscounter: true,
			lastweekreset: true,
			stock: true,
			limited: true
		},
		with: {
			author: {
				columns: {
					userid: true,
					coins: true
				}
			}
		}
	})

	if (!item || item.price === null) {
		return error(404, {
			success: false,
			message: "This item doesn't exist!",
			data: {}
		})
	}

	if (item.moderationstate === 'rejected') {
		return error(403, {
			success: false,
			message: 'This item is moderated!',
			data: {}
		})
	}

	if (item.onsale === false) {
		return error(403, {
			success: false,
			message: 'This item is not for sale!',
			data: {}
		})
	}

	if (item.stock !== null && item.stock <= 0) {
		return error(403, {
			success: false,
			message: 'This item is out of stock!',
			data: {}
		})
	}

	if (item.limited === 'limited') {
		return error(403, {
			success: false,
			message: 'This item cannot be purchased!',
			data: {}
		})
	}

	const alreadyOwned = await db
		.select()
		.from(inventoryTable)
		.where(and(eq(inventoryTable.userid, user.userid), eq(inventoryTable.itemid, assetId)))
		.limit(1)

	if (alreadyOwned.length > 0 && item.limited !== 'limitedu') {
		return json({
			success: false,
			message: 'You already own this item!',
			status: 'AlreadyOwned',
			receipt: ''
		})
	}

	if (user.coins < item.price) {
		return error(400, {
			success: false,
			message: 'Not enough moons!',
			data: {}
		})
	}

	await db.transaction(async (tx) => {
		try {
			if (item.price !== null) {
				if (item.author.userid !== Number(user.userid)) {
					const [newUser] = await tx // take away they mooners
						.update(usersTable)
						.set({ coins: user.coins - item.price })
						.where(eq(usersTable.userid, user.userid))
						.returning({ coins: usersTable.coins })

					if (newUser.coins < 0) {
						tx.rollback()
						return
					}
				}

				await tx.insert(inventoryTable).values({
					itemid: assetId,
					userid: user.userid,
					wearing: false,
					itemtype: item.assetType,
					serialid: item.sales + 1
				})

				if (item.assetType === 'packages') {
					const outfit = await tx.query.outfitsTable.findFirst({
						where: eq(outfitsTable.associatedpackageid, assetId),
						columns: {
							assets: true
						}
					})

					if (!outfit) {
						tx.rollback() // shouldn't be possible?
						return
					}

					if (outfit) {
						for (const item of outfit.assets) {
							const bodyPart = await tx.query.assetTable.findFirst({
								where: eq(assetTable.assetid, item),
								columns: { assetType: true }
							})

							if (bodyPart) {
								await tx.insert(inventoryTable).values({
									itemid: item,
									userid: user.userid,
									wearing: false,
									itemtype: bodyPart.assetType
								})
							}
						}
					}
				}

				await tx.insert(transactionsTable).values({
					userid: user.userid,
					itemid: assetId,
					type: 'purchase',
					amount: item.price,
					sourceuserid: item.author.userid
				})

				if (item.author.userid !== Number(user.userid)) {
					await tx
						.update(usersTable)
						.set({ coins: item.author.coins + item.price })
						.where(eq(usersTable.userid, item.author.userid)) // pay the owner of shirt/asset
				}

				await tx.insert(transactionsTable).values({
					userid: item.author.userid,
					itemid: assetId,
					type: 'sales',
					amount: item.price,
					sourceuserid: user.userid
				})

				if (
					new Date().valueOf() - item.lastweekreset.valueOf() >
					7 * 24 * 60 * 60 * 1000 // 7 days
				) {
					await tx
						.update(assetTable)
						.set({ last7dayscounter: 0 })
						.where(eq(assetTable.assetid, assetId))

					await tx
						.update(assetTable)
						.set({ lastweekreset: new Date() })
						.where(eq(assetTable.assetid, assetId))
				} else {
					await tx
						.update(assetTable)
						.set({ last7dayscounter: Number(item.last7dayscounter) + 1 })
						.where(eq(assetTable.assetid, assetId))
				}

				await tx
					.update(assetTable)
					.set({ sales: item.sales + 1 })
					.where(eq(assetTable.assetid, assetId))

				if (item.stock && item.stock > 0) {
					await tx
						.update(assetTable)
						.set({ stock: item.stock - 1 })
						.where(eq(assetTable.assetid, assetId))
				}
			}
		} catch (e) {
			tx.rollback()
			return
		}
	})

	return json({
		success: true,
		message: 'Item purchased!',
		status: 'Bought',
		receipt: ''
	})
}
