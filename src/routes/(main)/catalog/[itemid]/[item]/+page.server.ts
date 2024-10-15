import type { Actions } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema as sellLimitedSchema } from '$lib/schemas/catalog/selllimitedschema'
import { formSchema as sellLimitedUSchema } from '$lib/schemas/catalog/selllimiteduschema'
import { formSchema as inventoryIdSchema } from '$lib/schemas/catalog/inventoryidschema'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { eq, and, desc } from 'drizzle-orm'
import {
	assetTable,
	inventoryTable,
	privateSellersTable,
	salesHistoryTable,
	transactionsTable,
	usersTable
} from '$lib/server/schema'
import { error } from 'console'

export const load: PageServerLoad = async () => {
	const sellFormLimited = await superValidate(zod(sellLimitedSchema))
	const sellFormLimitedU = await superValidate(zod(sellLimitedUSchema))
	const inventoryId = await superValidate(zod(inventoryIdSchema))

	return {
		sellFormLimited,
		sellFormLimitedU,
		inventoryId
	}
}

export const actions: Actions = {
	selllimitedu: async (event) => {
		const form = await superValidate(event, zod(sellLimitedUSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { locals, params } = event

		const [inventory] = await db
			.select({ inventoryid: inventoryTable.inventoryid })
			.from(inventoryTable)
			.where(
				and(
					eq(inventoryTable.userid, locals.user.userid),
					eq(inventoryTable.itemid, Number(params.itemid)),
					eq(inventoryTable.serialid, form.data.serial)
				)
			)
			.limit(1)

		if (!inventory) {
			return setError(form, 'price', "You don't own this!")
		}

		const alreadySelling = await db.query.privateSellersTable.findFirst({
			where: eq(privateSellersTable.inventoryid, inventory.inventoryid),
			with: {
				item: {
					columns: {
						serialid: true
					}
				}
			},
			orderBy: desc(privateSellersTable.price)
		})

		if (alreadySelling) {
			return setError(form, 'price', 'You are already selling this item!')
		}

		await db.insert(privateSellersTable).values({
			userid: locals.user.userid,
			assetid: Number(params.itemid),
			price: form.data.price,
			inventoryid: inventory.inventoryid
		})
	},
	selllimited: async (event) => {
		const form = await superValidate(event, zod(sellLimitedSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { locals, params } = event

		const [inventory] = await db
			.select({ inventoryid: inventoryTable.inventoryid })
			.from(inventoryTable)
			.where(
				and(
					eq(inventoryTable.userid, locals.user.userid),
					eq(inventoryTable.itemid, Number(params.itemid))
				)
			)
			.limit(1)
			.orderBy(desc(inventoryTable.serialid))

		if (!inventory) {
			return setError(form, 'price', "You don't own this!")
		}

		const alreadySelling = await db.query.privateSellersTable.findFirst({
			where: and(
				eq(privateSellersTable.userid, locals.user.userid),
				eq(privateSellersTable.assetid, Number(params.itemid))
			),
			orderBy: desc(privateSellersTable.price)
		})

		if (alreadySelling) {
			return setError(form, 'price', 'You are already selling this item!')
		}

		await db.insert(privateSellersTable).values({
			userid: locals.user.userid,
			assetid: Number(params.itemid),
			price: form.data.price,
			inventoryid: inventory.inventoryid
		})
	},
	removelimited: async (event) => {
		const form = await superValidate(event, zod(inventoryIdSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { locals } = event

		const seller = await db.query.privateSellersTable.findFirst({
			where: eq(privateSellersTable.inventoryid, form.data.inventoryId),
			columns: {
				userid: true
			}
		})

		if (!seller) {
			return error(404, 'Item not found!')
		}

		if (seller.userid != locals.user.userid) {
			return error(403, 'You do not own this item!')
		}

		await db
			.delete(privateSellersTable)
			.where(eq(privateSellersTable.inventoryid, form.data.inventoryId))

		return { form }
	},
	buylimited: async (event) => {
		const form = await superValidate(event, zod(inventoryIdSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { locals } = event

		const seller = await db.query.privateSellersTable.findFirst({
			where: eq(privateSellersTable.inventoryid, form.data.inventoryId),
			columns: {
				userid: true,
				price: true,
				assetid: true
			},
			with: {
				user: {
					columns: {
						coins: true
					}
				}
			}
		})

		if (!seller) {
			return error(404, 'Item not found!')
		}

		if (seller.userid == locals.user.userid) {
			return error(403, 'You cannot buy your own item!')
		}

		if (locals.user.coins < seller.price) {
			return error(400, {
				success: false,
				message: 'Not enough moons!',
				data: {}
			})
		}

		await db.transaction(async (tx) => {
			try {
				const [newUser] = await tx // take away they mooners
					.update(usersTable)
					.set({ coins: locals.user.coins - seller.price })
					.where(eq(usersTable.userid, locals.user.userid))
					.returning({ coins: usersTable.coins })

				if (newUser.coins < 0) {
					tx.rollback()
					return
				}

				await tx
					.delete(privateSellersTable)
					.where(eq(privateSellersTable.inventoryid, form.data.inventoryId))

				await tx
					.update(inventoryTable)
					.set({
						userid: locals.user.userid
					})
					.where(eq(inventoryTable.inventoryid, form.data.inventoryId))

				await tx.insert(transactionsTable).values({
					userid: locals.user.userid,
					itemid: seller.assetid,
					type: 'purchase',
					amount: seller.price,
					sourceuserid: seller.userid
				})

				await tx
					.update(usersTable)
					.set({ coins: seller.user.coins + seller.price })
					.where(eq(usersTable.userid, seller.userid)) // pay the owner of limited

				await tx.insert(transactionsTable).values({
					userid: seller.userid,
					itemid: seller.assetid,
					type: 'sales',
					amount: seller.price,
					sourceuserid: locals.user.userid
				})

				const currentRap = await tx.query.assetTable.findFirst({
					where: eq(assetTable.assetid, seller.assetid),
					columns: {
						recentaverageprice: true,
						limited: true
					}
				})

				if (
					!currentRap ||
					(!currentRap.recentaverageprice && currentRap.recentaverageprice !== 0)
				) {
					if (currentRap?.limited !== 'limited') {
						// "limiteds" originally start out as normal items so they wont have rap
						tx.rollback()
						return
					} else {
						currentRap.recentaverageprice = 0
					}
				}

				const newRap = Math.ceil(
					Math.abs(
						(seller.price - currentRap.recentaverageprice) * 0.1 + currentRap.recentaverageprice
					)
				)

				await tx
					.update(assetTable)
					.set({ recentaverageprice: newRap })
					.where(eq(assetTable.assetid, seller.assetid))

				await tx.insert(salesHistoryTable).values({
					userid: locals.user.userid,
					assetid: seller.assetid,
					inventoryid: form.data.inventoryId,
					price: seller.price,
					currentaverageprice: newRap
				})
			} catch (e) {
				console.log(e)
				tx.rollback()
				return
			}
		})
	}
}
