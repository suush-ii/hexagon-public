import { and, eq, not } from 'drizzle-orm'
import { assetTable } from '../schema'

export const commonWhere = and(
	not(eq(assetTable.assetType, 'games')),
	not(eq(assetTable.assetType, 'decals')),
	not(eq(assetTable.assetType, 'images')),
	not(eq(assetTable.assetType, 'audio')),
	eq(assetTable.moderationstate, 'approved')
) // library assets
