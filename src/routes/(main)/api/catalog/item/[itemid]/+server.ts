import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const GET: RequestHandler = async ({ params }) => {
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
			recentaverageprice: true,
			associatedgameid: true
		},
		with: {
			author: {
				columns: {
					username: true
				}
			}
		}
	})

	if (!item || item.assetType === 'games') {
		error(404, { success: false, message: 'Item not found.', data: {} })
	}

	return json({ success: true, message: ' ', data: { item } })
}
