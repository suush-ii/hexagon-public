import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { eq, count, ne, and } from 'drizzle-orm'
import { assetTable } from '$lib/server/schema/assets'

export const load: PageServerLoad = async ({ url, depends }) => {
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
		.where(
			and(
				eq(assetTable.moderationstate, 'pending'),
				ne(assetTable.assetType, 'shirts'),
				ne(assetTable.assetType, 'pants')
			)
		)

	const assetCount = await db
		.select({ count: count() })
		.from(assetTable)
		.where(
			and(
				eq(assetTable.moderationstate, 'pending'),
				ne(assetTable.assetType, 'shirts'),
				ne(assetTable.assetType, 'pants')
			)
		) // images are moderated not the clothes themselves

	depends('app:assetqueue')

	return {
		assets,
		assetCount: assetCount[0].count
	}
}

export const actions: Actions = {
	default: async (event) => {}
}
