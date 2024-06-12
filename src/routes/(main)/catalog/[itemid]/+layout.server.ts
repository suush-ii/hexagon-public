import type { LayoutServerLoad } from './$types'
import { db } from '$lib/server/db'
import { ne, and, eq, sql, count } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { assetTable, assetFavoritesTable } from '$lib/server/schema'
import { inventoryTable } from '$lib/server/schema/users'
import { slugify } from '$lib/utils'
import { commonWhere } from '$lib/server/catalog'
import { adminAssets } from '../../admin/catalog/upload/[item]'

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const result = await z.number().safeParseAsync(Number(params.itemid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const item = await db.query.assetTable.findFirst({
		where: and(eq(assetTable.assetid, Number(params.itemid)), ne(assetTable.assetType, 'games')),
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
			onsale: true
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

	if (params?.item !== slugItemName && slugItemName !== '') {
		redirect(302, '/catalog/' + Number(params.itemid) + '/' + slugItemName)
	}

	const alreadyOwned = await db
		.select()
		.from(inventoryTable)
		.where(
			and(eq(inventoryTable.userid, locals.user.userid), eq(inventoryTable.itemid, item.assetid))
		)
		.limit(1)

	const favorites = await db
		.select({ count: count() })
		.from(assetFavoritesTable)
		.where(eq(assetFavoritesTable.assetid, item.assetid))
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
		alreadyFavorited: alreadyFavorited.length > 0,
		favorites: favorites[0].count,
		recommendations,
		canEdit,
		adminAsset
	}
}
