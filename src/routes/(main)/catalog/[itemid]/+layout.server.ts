import type { LayoutServerLoad } from './$types'
import { db } from '$lib/server/db'
import { ne, and, eq, sql, count, desc, asc, gt } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import {
	assetTable,
	assetFavoritesTable,
	privateSellersTable,
	salesHistoryTable
} from '$lib/server/schema'
import { inventoryTable } from '$lib/server/schema/users'
import { getPageNumber, slugify } from '$lib/utils'
import { commonWhere } from '$lib/server/catalog'
import { adminAssets } from '../../admin/catalog/upload/[item]'

export const load: LayoutServerLoad = async ({ params, locals, url }) => {
	const result = await z.number().safeParseAsync(Number(params.itemid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const item = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, Number(params.itemid)),
		columns: {
			assetname: true,
			price: true,
			assetid: true,
			assetType: true,
			creatoruserid: true,
			created: true,
			updated: true,
			sales: true,
			description: true,
			moderationstate: true,
			genres: true,
			gearattributes: true,
			onsale: true,
			favorites: true,
			stock: true,
			limited: true,
			recentaverageprice: true
		},
		with: {
			author: {
				columns: {
					username: true
				}
			}
		}
	})

	if (!item) {
		error(404, { success: false, message: 'Item not found.', data: {} })
	}

	const slugItemName = slugify(item.assetname)

	if (item.assetType === 'games') {
		return redirect(302, '/games/' + Number(params.itemid) + '/' + slugItemName)
	}

	if (params?.item !== slugItemName && slugItemName !== '') {
		return redirect(302, '/catalog/' + Number(params.itemid) + '/' + slugItemName)
	}

	const alreadyOwned = await db
		.select()
		.from(inventoryTable)
		.where(
			and(eq(inventoryTable.userid, locals.user.userid), eq(inventoryTable.itemid, item.assetid))
		)
		.limit(1)

	const [ownedCount] = await db
		.select({ count: count() })
		.from(inventoryTable)
		.where(
			and(eq(inventoryTable.userid, locals.user.userid), eq(inventoryTable.itemid, item.assetid))
		)
		.limit(1)

	const alreadyFavorited = await db
		.select()
		.from(assetFavoritesTable)
		.where(
			and(
				eq(assetFavoritesTable.userid, locals.user.userid),
				eq(assetFavoritesTable.assetid, item.assetid)
			)
		)
		.limit(1)

	let limitedmode = (item.limited === 'limitedu' && item.stock === 0) || item.limited === 'limited'

	let privateSellers

	let privateSellersCount

	let owned

	let saleshistory

	let volumehistory

	if (limitedmode) {
		;[privateSellersCount] = await db
			.select({ count: count() })
			.from(privateSellersTable)
			.where(eq(privateSellersTable.assetid, Number(params.itemid)))
			.limit(1)

		let page = getPageNumber(url, 'salesPage')

		const size = 5

		if (privateSellersCount.count < (page - 1) * size) {
			page = 1
		}

		privateSellers = await db.query.privateSellersTable.findMany({
			where: eq(privateSellersTable.assetid, Number(params.itemid)),
			orderBy: asc(privateSellersTable.price),
			with: {
				item: {
					columns: {
						serialid: true,
						inventoryid: true
					}
				},
				user: {
					columns: {
						username: true
					}
				}
			},
			limit: 5,
			offset: (page - 1) * size
		})

		owned = await db
			.select({ serialid: inventoryTable.serialid })
			.from(inventoryTable)
			.where(
				and(
					eq(inventoryTable.userid, locals.user.userid),
					eq(inventoryTable.itemid, Number(params.itemid))
				)
			)
			.orderBy(desc(inventoryTable.serialid))
			.limit(100)

		const subquery = db
			.select({
				x: sql`date_trunc('day', ${salesHistoryTable.time})`.as('x'),
				max_price: sql`MAX(${salesHistoryTable.currentaverageprice})`.as('max_price')
			})
			.from(salesHistoryTable)
			.where(
				and(
					eq(salesHistoryTable.assetid, Number(params.itemid)),
					gt(salesHistoryTable.time, new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)) // 180 days
				)
			)
			.groupBy(sql`date_trunc('day', ${salesHistoryTable.time})`)
			.as('subquery')

		saleshistory = await db
			.select({
				x: subquery.x,
				y: salesHistoryTable.currentaverageprice
			})
			.from(salesHistoryTable)
			.innerJoin(
				subquery,
				and(
					eq(sql`date_trunc('day', ${salesHistoryTable.time})`, subquery.x),
					eq(salesHistoryTable.currentaverageprice, subquery.max_price)
				)
			)
			.orderBy(sql`x DESC`)
			.limit(1000)

		volumehistory = await db
			.select({ x: sql`date_trunc('day', ${salesHistoryTable.time})`.as('x'), y: count() })
			.from(salesHistoryTable)
			.where(
				and(
					eq(salesHistoryTable.assetid, Number(params.itemid)),
					gt(salesHistoryTable.time, new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)) // 180 days
				)
			)
			.orderBy(sql`x DESC`)
			.limit(1000)
			.groupBy(sql`date_trunc('day', ${salesHistoryTable.time})`)
	}

	const recommendations = await db.query.assetTable.findMany({
		where: and(
			ne(assetTable.assetid, Number(params.itemid)),
			eq(assetTable.assetType, item.assetType),
			commonWhere
		), // we dont wanna recommend library assets
		columns: {
			assetname: true,
			assetid: true,
			creatoruserid: true
		},
		with: {
			author: {
				columns: {
					username: true
				}
			}
		},
		limit: 10,
		orderBy: sql<number>`random()`
	})

	let canEdit = Number(locals.user.userid) === item.creatoruserid
	let adminAsset = false

	if (locals.user.role !== 'normal') {
		if (adminAssets.some((asset) => asset === item.assetType)) {
			// allow admins to edit any others admin uploaded assets
			canEdit = true
			adminAsset = true
		}
	}

	return {
		item: item,
		alreadyOwned: alreadyOwned.length > 0,
		ownedCount: ownedCount.count,
		alreadyFavorited: alreadyFavorited.length > 0,
		recommendations,
		canEdit,
		adminAsset,
		canModerate: locals.user.role !== 'normal' && locals.user.role !== 'uploader',
		alreadySelling: owned ? owned.length > 0 : false,
		limitedmode,
		privateSellers,
		privateSellersCount: privateSellersCount?.count ?? 0,
		owned: owned ?? [],
		userid: locals.user.userid,
		saleshistory,
		volumehistory
	}
}
