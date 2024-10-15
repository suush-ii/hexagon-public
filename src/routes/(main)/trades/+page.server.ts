import type { Actions, PageServerLoad } from './$types.js'
import { db } from '$lib/server/db'
import { eq, inArray, and, or, count } from 'drizzle-orm'
import {
	inventoryTable,
	privateSellersTable,
	tradesTable,
	transactionsTable,
	usersTable
} from '$lib/server/schema'
import { getPageNumber } from '$lib/utils'
import { fail, message, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema as tradeSchema } from '$lib/schemas/catalog/tradeschema'
import { error } from '@sveltejs/kit'
import { tradeSql } from '$lib/server/catalog/tradeSql'

export const load: PageServerLoad = async ({ url, locals }) => {
	let page = getPageNumber(url)
	const tradeForm = await superValidate(zod(tradeSchema))

	const size = 30
	let type = url.searchParams.get('type') ?? 'inbound'

	if (type !== 'inbound' && type !== 'outbound' && type !== 'completed' && type !== 'inactive') {
		type = 'inbound'
	}

	if (type === 'inbound') {
		const [tradesCount] = await db
			.select({ count: count() })
			.from(tradesTable)
			.where(and(eq(tradesTable.recipient, locals.user.userid), eq(tradesTable.status, 'pending')))

		if (tradesCount.count < (page - 1) * size) {
			page = 1
		}

		const trades = await tradeSql(size, page).where(
			and(eq(tradesTable.recipient, locals.user.userid), eq(tradesTable.status, 'pending'))
		)

		return {
			trades,
			tradesCount: tradesCount.count,
			tradeForm
		}
	}

	if (type === 'outbound') {
		const [tradesCount] = await db
			.select({ count: count() })
			.from(tradesTable)
			.where(and(eq(tradesTable.senderid, locals.user.userid), eq(tradesTable.status, 'pending')))

		if (tradesCount.count < (page - 1) * size) {
			page = 1
		}

		const trades = await tradeSql(size, page).where(
			and(eq(tradesTable.senderid, locals.user.userid), eq(tradesTable.status, 'pending'))
		)

		return {
			trades,
			tradesCount: tradesCount.count,
			tradeForm
		}
	}

	if (type === 'completed') {
		const [tradesCount] = await db
			.select({ count: count() })
			.from(tradesTable)
			.where(
				and(
					or(
						eq(tradesTable.recipient, locals.user.userid),
						eq(tradesTable.senderid, locals.user.userid)
					),
					eq(tradesTable.status, 'accepted')
				)
			)

		if (tradesCount.count < (page - 1) * size) {
			page = 1
		}

		const trades = await tradeSql(size, page).where(
			and(
				or(
					eq(tradesTable.recipient, locals.user.userid),
					eq(tradesTable.senderid, locals.user.userid)
				),
				eq(tradesTable.status, 'accepted')
			)
		)

		return {
			trades,
			tradesCount: tradesCount.count,
			tradeForm
		}
	}

	if (type === 'inactive') {
		const [tradesCount] = await db
			.select({ count: count() })
			.from(tradesTable)
			.where(
				and(
					or(
						eq(tradesTable.recipient, locals.user.userid),
						eq(tradesTable.senderid, locals.user.userid)
					),
					eq(tradesTable.status, 'denied')
				)
			)

		if (tradesCount.count < (page - 1) * size) {
			page = 1
		}

		const trades = await tradeSql(size, page).where(
			and(
				or(
					eq(tradesTable.recipient, locals.user.userid),
					eq(tradesTable.senderid, locals.user.userid)
				),
				eq(tradesTable.status, 'denied')
			)
		)

		return {
			trades,
			tradesCount: tradesCount.count,
			tradeForm
		}
	}

	return {
		trades: [],
		tradesCount: 0,
		tradeForm
	}
}

export const actions: Actions = {
	trade: async (event) => {
		const form = await superValidate(event, zod(tradeSchema))

		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { locals } = event

		const trade = await db.query.tradesTable.findFirst({
			where: eq(tradesTable.requestid, form.data.requestid),
			columns: {
				recipient: true,
				senderid: true,
				requestingmoons: true,
				offeringmoons: true,
				requesting: true,
				offering: true,
				status: true
			}
		})

		if (!trade) {
			return error(404, {
				success: false,
				message: 'Trade not found.',
				data: {}
			})
		}

		if (trade.recipient != locals.user.userid) {
			return error(403, {
				success: false,
				message: 'You are not the recipient of this trade.',
				data: {}
			})
		}

		if (trade.status !== 'pending') {
			return error(403, {
				success: false,
				message: 'This trade is not pending.',
				data: {}
			})
		}

		const sender = await db.query.usersTable.findFirst({
			where: eq(usersTable.userid, trade.senderid),
			columns: {
				coins: true,
				username: true
			}
		})

		if (!sender) {
			return error(404, {
				success: false,
				message: 'Sender not found.',
				data: {}
			})
		}

		if (form.data.action === 'decline' || form.data.action === 'counter') {
			await db
				.update(tradesTable)
				.set({ status: 'denied', denyreason: 'denied' })
				.where(eq(tradesTable.requestid, form.data.requestid))

			return message(form, `You have declined ${sender.username}'s trade request.`)
		}

		if (sender.coins < trade.offeringmoons) {
			await db
				.update(tradesTable)
				.set({ status: 'denied', denyreason: 'error' })
				.where(eq(tradesTable.requestid, form.data.requestid))

			return message(
				form,
				"The trade couldn't be completed because the sender doesn't have enough moons."
			)
		}

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.userid, locals.user.userid),
			columns: {
				coins: true
			}
		})

		if (!user) {
			return error(404, {
				success: false,
				message: 'User not found.',
				data: {}
			})
		}

		if (user.coins < trade.requestingmoons) {
			await db
				.update(tradesTable)
				.set({ status: 'denied', denyreason: 'error' })
				.where(eq(tradesTable.requestid, form.data.requestid))

			return message(form, "The trade couldn't be completed because you don't have enough moons.")
		}

		await db.transaction(async (tx) => {
			try {
				const senderInventory = await db.query.inventoryTable.findMany({
					where: and(
						eq(inventoryTable.userid, trade.senderid),
						inArray(inventoryTable.inventoryid, trade.offering)
					),
					columns: {
						inventoryid: true
					}
				})

				if (!senderInventory) {
					return error(404, {
						success: false,
						message: 'Sender inventory not found.',
						data: {}
					})
				}

				const senderInventoryIds = senderInventory.map((item) => item.inventoryid)
				for (const item of trade.offering) {
					if (!senderInventoryIds.includes(item)) {
						tx.rollback()

						return message(
							form,
							`The trade couldn't be completed because the sender doesn't have an item.`
						)
					}

					await tx
						.update(inventoryTable)
						.set({ userid: locals.user.userid, wearing: false })
						.where(eq(inventoryTable.inventoryid, item))

					await tx.delete(privateSellersTable).where(eq(privateSellersTable.inventoryid, item))
				}

				const recipientInventory = await db.query.inventoryTable.findMany({
					where: and(
						eq(inventoryTable.userid, locals.user.userid),
						inArray(inventoryTable.inventoryid, trade.requesting)
					),
					columns: {
						inventoryid: true
					}
				})

				if (!recipientInventory) {
					tx.rollback()

					return error(404, {
						success: false,
						message: 'Recipient inventory not found.',
						data: {}
					})
				}

				const recipientInventoryIds = recipientInventory.map((item) => item.inventoryid)
				for (const item of trade.requesting) {
					if (!recipientInventoryIds.includes(item)) {
						tx.rollback()

						return message(form, `The trade couldn't be completed because you don't have an item.`)
					}

					await tx
						.update(inventoryTable)
						.set({ userid: trade.senderid, wearing: false })
						.where(eq(inventoryTable.inventoryid, item))

					await tx.delete(privateSellersTable).where(eq(privateSellersTable.inventoryid, item))
				}

				let userCoins = user.coins + trade.offeringmoons - trade.requestingmoons
				let senderCoins = sender.coins - trade.offeringmoons + trade.requestingmoons

				if (userCoins < 0 || senderCoins < 0) {
					tx.rollback()

					return message(form, "The trade couldn't be completed because of an error.")
				}

				await tx
					.update(usersTable)
					.set({ coins: userCoins })
					.where(eq(usersTable.userid, locals.user.userid))

				await tx
					.update(usersTable)
					.set({ coins: senderCoins })
					.where(eq(usersTable.userid, trade.senderid))

				await tx
					.update(tradesTable)
					.set({ status: 'accepted' })
					.where(eq(tradesTable.requestid, form.data.requestid))

				await tx.insert(transactionsTable).values({
					userid: locals.user.userid,
					amount: trade.offeringmoons - trade.requestingmoons,
					type: 'trade'
				})

				await tx.insert(transactionsTable).values({
					userid: trade.senderid,
					amount: trade.requestingmoons - trade.offeringmoons,
					type: 'trade'
				})
			} catch (e) {
				console.log(e)

				await db
					.update(tradesTable)
					.set({ status: 'denied', denyreason: 'error' })
					.where(eq(tradesTable.requestid, form.data.requestid))

				return
			}
		})

		return message(form, `You have accepted ${sender.username}'s trade request.`)
	}
}
