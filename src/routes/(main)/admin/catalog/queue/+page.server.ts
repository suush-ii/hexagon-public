import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { eq, count, ne, and } from 'drizzle-orm'
import { assetTable } from '$lib/server/schema/assets'

export const load: PageServerLoad = async ({ depends }) => {
	const filter = and(
		eq(assetTable.moderationstate, 'pending'),
		ne(assetTable.assetType, 'shirts'),
		ne(assetTable.assetType, 'pants'),
		ne(assetTable.assetType, 'decals')
	)

	const assets = await db
		.select({
			assetId: assetTable.assetid,
			assetUrl: assetTable.simpleasseturl,
			creatorUserId: assetTable.creatoruserid,
			assetType: assetTable.assetType,
			assetName: assetTable.assetname,
			moderationState: assetTable.moderationstate
		})
		.from(assetTable)
		.limit(20)
		.where(filter)

	const assetCount = await db.select({ count: count() }).from(assetTable).where(filter) // images are moderated not the clothes themselves

	depends('app:assetqueue')

	return {
		assets,
		assetCount: assetCount[0].count
	}
}
