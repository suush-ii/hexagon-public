import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { eq, count, ne, and } from 'drizzle-orm'
import { assetTable, usersTable } from '$lib/server/schema'

import { filter } from '.'

export const load: PageServerLoad = async ({ depends }) => {
	const assets = await db
		.select({
			assetId: assetTable.assetid,
			assetUrl: assetTable.simpleasseturl,
			creatorUserId: assetTable.creatoruserid,
			assetType: assetTable.assetType,
			assetName: assetTable.assetname,
			moderationState: assetTable.moderationstate,
			creatorusername: usersTable.username
		})
		.from(assetTable)
		.limit(20)
		.where(filter)
		.innerJoin(usersTable, eq(usersTable.userid, assetTable.creatoruserid))

	const assetCount = await db.select({ count: count() }).from(assetTable).where(filter) // images are moderated not the clothes themselves

	depends('app:assetqueue')

	return {
		assets: assets.map((asset) => ({ ...asset, punish: false })),
		assetCount: assetCount[0].count
	}
}
