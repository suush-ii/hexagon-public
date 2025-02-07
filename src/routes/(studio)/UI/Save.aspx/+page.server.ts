import { db } from '$lib/server/db'
import type { PageServerLoad } from './$types'
import { assetTable } from '$lib/server/schema'
import { and, eq, sql, desc } from 'drizzle-orm'
import { commonWhereLibrary } from '$src/lib/server/catalog'
export const csr = false

export const load: PageServerLoad = async (event) => {
	const session = event.locals

	const assets = await db.query.assetTable.findMany({
		where: and(
			eq(assetTable.creatoruserid, session.user.userid),
			commonWhereLibrary,
			eq(assetTable.assetType, 'models')
		),
		// for ingame purchase prompt
		columns: {
			moderationstate: true,
			assetType: true,
			assetname: true,
			assetid: true
		},
		extras: {
			simpleasseturl:
				sql`CASE WHEN ${assetTable.moderationstate} = 'approved' THEN ${assetTable.assetrender} ELSE NULL END`.as(
					'simpleasseturl'
				)
		},
		limit: 50,
		orderBy: desc(assetTable.updated)
	})

	return {
		assets
	}
}
