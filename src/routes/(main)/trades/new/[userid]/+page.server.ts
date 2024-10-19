import { assetTable, inventoryTable, tradesTable, usersTable } from '$lib/server/schema'
import { db } from '$src/lib/server/db'
import { error, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { eq, and, isNotNull, inArray, count, sql, aliasedTable } from 'drizzle-orm'
import { z } from 'zod'
import { fail, message, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema } from '.'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { getPageNumber } from '$src/lib/utils'

const limiter = new RateLimiter({
	IP: [1, '15s']
})

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const result = await z.coerce.number().safeParseAsync(params.userid)

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const resultTrade = await z.coerce
		.number()
		.positive()
		.int()
		.safeParseAsync(url.searchParams.get('trade'))

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, result.data),
		columns: {
			userid: true,
			username: true
		}
	})

	if (!user) {
		error(404, { success: false, message: 'User not found.' })
	}

	if (user.userid == locals.user.userid) {
		error(400, { success: false, message: 'You cannot trade with yourself.' })
	}

	const inventoryCount = await db
		.select({ count: count() })
		.from(inventoryTable)
		.where(and(eq(inventoryTable.userid, locals.user.userid), isNotNull(assetTable.limited)))
		.innerJoin(assetTable, eq(assetTable.assetid, inventoryTable.itemid))
		.limit(1)

	let pageInventory = getPageNumber(url, 'inventory')

	const sizeInventory = 12

	if (inventoryCount[0].count < (pageInventory - 1) * sizeInventory) {
		pageInventory = 1
	}

	const inventoryOtherCount = await db
		.select({ count: count() })
		.from(inventoryTable)
		.where(and(eq(inventoryTable.userid, result.data), isNotNull(assetTable.limited)))
		.innerJoin(assetTable, eq(assetTable.assetid, inventoryTable.itemid))
		.limit(1)

	let pageOtherInventory = getPageNumber(url, 'otherinventory')

	if (inventoryOtherCount[0].count < (pageOtherInventory - 1) * sizeInventory) {
		pageOtherInventory = 1
	}

	const inventory = await db
		.select({
			assetid: inventoryTable.itemid,
			assetname: assetTable.assetname,
			recentaverageprice: assetTable.recentaverageprice,
			originalprice: assetTable.price,
			serial: inventoryTable.serialid,
			sold: assetTable.sales,
			inventoryid: inventoryTable.inventoryid
		})
		.from(inventoryTable)
		.where(and(eq(inventoryTable.userid, locals.user.userid), isNotNull(assetTable.limited)))
		.innerJoin(assetTable, eq(assetTable.assetid, inventoryTable.itemid))
		.limit(sizeInventory)
		.offset((pageInventory - 1) * sizeInventory)

	const inventoryOther = await db
		.select({
			assetid: inventoryTable.itemid,
			assetname: assetTable.assetname,
			recentaverageprice: assetTable.recentaverageprice,
			originalprice: assetTable.price,
			serial: inventoryTable.serialid,
			sold: assetTable.sales,
			inventoryid: inventoryTable.inventoryid
		})
		.from(inventoryTable)
		.where(and(eq(inventoryTable.userid, result.data), isNotNull(assetTable.limited)))
		.innerJoin(assetTable, eq(assetTable.assetid, inventoryTable.itemid))
		.limit(sizeInventory)
		.offset((pageOtherInventory - 1) * sizeInventory)

	const form = await superValidate(zod(formSchema))

	if (resultTrade.success === true) {
		const requesting = aliasedTable(inventoryTable, 'requesting')
		const requestingAsset = aliasedTable(assetTable, 'requestingAsset')

		const [trade] = await db
			.select({
				status: tradesTable.status,
				offering: sql`coalesce(json_agg(DISTINCT jsonb_build_object('itemId', ${inventoryTable.itemid}, 'inventoryid', ${inventoryTable.inventoryid}, 'itemName', ${assetTable.assetname}, 'serial', ${inventoryTable.serialid}, 'sales', ${assetTable.sales}, 'recentaverageprice', ${assetTable.recentaverageprice}, 'originalprice', ${assetTable.price}, 'sold', ${assetTable.sales})) FILTER (WHERE ${inventoryTable.itemid} IS NOT NULL), '[]'::json)`,
				requesting: sql`coalesce(json_agg(DISTINCT jsonb_build_object('itemId', ${requesting.itemid}, 'inventoryid', ${requesting.inventoryid}, 'itemName', ${requestingAsset.assetname}, 'serial', ${requesting.serialid}, 'sales', ${requestingAsset.sales}, 'recentaverageprice', ${requestingAsset.recentaverageprice}, 'originalprice', ${requestingAsset.price}, 'sold', ${assetTable.sales})) FILTER (WHERE ${requesting.itemid} IS NOT NULL), '[]'::json)`,
				offeringmoons: tradesTable.offeringmoons,
				requestingmoons: tradesTable.requestingmoons
			})
			.from(tradesTable)
			.where(
				and(
					eq(tradesTable.requestid, resultTrade.data),
					eq(tradesTable.recipient, locals.user.userid)
				)
			)
			.leftJoin(inventoryTable, sql`${inventoryTable.inventoryid} = ANY(${tradesTable.offering})`)
			.leftJoin(requesting, sql`${requesting.inventoryid} = ANY(${tradesTable.requesting})`)
			.leftJoin(assetTable, sql`${assetTable.assetid} = ${inventoryTable.itemid}`)
			.leftJoin(requestingAsset, sql`${requestingAsset.assetid} = ${requesting.itemid}`)
			.groupBy(
				tradesTable.time,
				tradesTable.senderid,
				tradesTable.status,
				tradesTable.offeringmoons,
				tradesTable.requestingmoons,
				tradesTable.requestid
			)
			.limit(1)

		if (!trade) {
			error(404, { success: false, message: 'Trade not found.' })
		}

		if (trade.status !== 'pending') {
			error(400, { success: false, message: 'Trade is not pending.' })
		}

		return {
			inventory,
			inventoryOther,
			user,
			form,
			trade
		}
	}

	return {
		inventory,
		inventoryOther,
		user,
		form,
		inventoryCount: inventoryCount[0].count,
		inventoryOtherCount: inventoryOtherCount[0].count
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		if (await limiter.isLimited(event)) {
			return message(form, "You're being rate limited.")
		}

		const [sent] = await db
			.select({ count: count() })
			.from(tradesTable)
			.where(
				and(
					eq(tradesTable.senderid, event.locals.user.userid),
					eq(tradesTable.recipient, Number(event.params.userid)),
					eq(tradesTable.status, 'pending')
				)
			)
			.limit(1)

		if (sent.count > 5) {
			return message(form, 'You have too many pending trades with this user.')
		}

		const { offering, requesting } = form.data
		const { params } = event

		const inventory = await db.query.inventoryTable.findMany({
			where: inArray(inventoryTable.inventoryid, offering.items),
			columns: {
				userid: true
			},
			with: {
				asset: {
					columns: {
						limited: true,
						stock: true
					}
				}
			}
		})

		for (const item of inventory) {
			if (!item.asset.limited) {
				return setError(form, 'offering.items._errors', 'One of the items is not limited.')
			}

			if (item.asset.limited === 'limitedu' && item.asset.stock !== 0) {
				return setError(form, 'offering.items._errors', 'Item not sold out.')
			}

			if (item.userid != event.locals.user.userid) {
				return setError(form, 'offering.items._errors', 'You do not own all of these items.')
			}
		}

		const inventoryOther = await db.query.inventoryTable.findMany({
			where: inArray(inventoryTable.inventoryid, requesting.items),
			columns: {
				userid: true
			},
			with: {
				asset: {
					columns: {
						limited: true,
						stock: true
					}
				}
			}
		})

		for (const item of inventoryOther) {
			if (!item.asset.limited) {
				return setError(form, 'offering.items._errors', 'One of the items is not limited.')
			}

			if (item.asset.limited === 'limitedu' && item.asset.stock !== 0) {
				return setError(form, 'offering.items._errors', 'Item not sold out.')
			}

			if (item.userid !== Number(params.userid)) {
				return setError(
					form,
					'requesting.items._errors',
					'Requestor does not own all of these items.'
				)
			}
		}

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.userid, event.locals.user.userid),
			columns: {
				coins: true,
				userid: true
			}
		})

		const userOther = await db.query.usersTable.findFirst({
			where: eq(usersTable.userid, Number(params.userid)),
			columns: {
				coins: true,
				userid: true
			}
		})

		if (!user || !userOther) {
			return setError(form, 'offering.items._errors', 'User not found.')
		}

		if (user.userid == userOther.userid) {
			return setError(form, 'offering.items._errors', 'You cannot trade with yourself.')
		}

		const moons = offering.moons ?? 0
		const moonsOther = requesting.moons ?? 0

		if (user.coins < moons) {
			return setError(form, 'offering.moons', 'You do not have enough moons.')
		}

		if (userOther.coins < moonsOther) {
			return setError(form, 'requesting.moons', 'They do not have enough moons.')
		}

		const resultTrade = await z.coerce
			.number()
			.positive()
			.int()
			.safeParseAsync(event.url.searchParams.get('trade'))

		if (resultTrade.success === true) {
			const trade = await db.query.tradesTable.findFirst({
				where: and(
					eq(tradesTable.requestid, resultTrade.data),
					eq(tradesTable.recipient, event.locals.user.userid)
				)
			})

			if (!trade) {
				return setError(form, 'offering.items._errors', 'Trade not found.')
			}

			if (trade.status !== 'pending') {
				return setError(form, 'offering.items._errors', 'Trade is not pending.')
			}

			await db
				.update(tradesTable)
				.set({ status: 'denied', denyreason: 'countered' })
				.where(eq(tradesTable.requestid, resultTrade.data))
		}

		await db.insert(tradesTable).values({
			senderid: event.locals.user.userid,
			recipient: Number(params.userid),
			offering: offering.items,
			requesting: requesting.items,
			offeringmoons: moons,
			requestingmoons: moonsOther
		})

		return redirect(302, `/trades`)
	}
}
