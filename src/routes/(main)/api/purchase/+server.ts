import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { assetTable } from '$lib/server/schema/assets'
import { transactionsTable, inventoryTable, usersTable } from '$lib/server/schema/users'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'

const itemSchema = z.object({
	itemid: z.coerce.number().int()
})

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	let itemid: number
	let result
	try {
		;({ itemid } = await request.json())
		result = await itemSchema.safeParseAsync({ itemid })
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const item = await db.query.assetTable.findFirst({
		where: and(eq(assetTable.assetid, itemid), ne(assetTable.assetType, 'games')),
		columns: {
			price: true,
			moderationstate: true,
			sales: true
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
			success: true,
			message: "This item doesn't exist!",
			data: {}
		})
	}

	if (item.moderationstate === 'rejected') {
		return error(403, {
			success: true,
			message: 'This item is moderated!',
			data: {}
		})
	}

	const alreadyOwned = await db
		.select()
		.from(inventoryTable)
		.where(eq(inventoryTable.userid, locals.user.userid))
		.limit(1)

	if (alreadyOwned.length > 0) {
		return error(400, {
			success: false,
			message: 'You already own this item!',
			data: {}
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
				const [newUser] = await tx // take away they mooners
					.update(usersTable)
					.set({ coins: user.coins - item.price })
					.where(eq(usersTable.userid, user.userid))
					.returning({ coins: usersTable.coins })

				if (newUser.coins < 0) {
					tx.rollback()
					return
				}

				await tx.insert(inventoryTable).values({ itemid, userid: user.userid, wearing: false })

				await tx.insert(transactionsTable).values({
					userid: user.userid,
					itemid,
					type: 'purchase',
					amount: item.price,
					sourceuserid: item.author.userid
				})

				await tx
					.update(usersTable)
					.set({ coins: item.author.coins + item.price })
					.where(eq(usersTable.userid, item.author.userid)) // pay the owner of shirt/asset

				await tx
					.update(assetTable)
					.set({ sales: item.sales + 1 })
					.where(eq(assetTable.assetid, itemid))

				return json({
					success: true,
					message: 'Item purchased!',
					data: {}
				})
			}
		} catch (e) {
			tx.rollback()
			return
		}
	})

	return error(400, {
		success: false,
		message: 'Not enough moons!',
		data: {}
	})
}
