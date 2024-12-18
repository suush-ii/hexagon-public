import { and, eq, not } from 'drizzle-orm'
import { assetTable } from '../schema'

export const commonWhere = and(
	not(eq(assetTable.assetType, 'games')),
	not(eq(assetTable.assetType, 'decals')),
	not(eq(assetTable.assetType, 'images')),
	not(eq(assetTable.assetType, 'audio')),
	not(eq(assetTable.assetType, 'gamepasses')),
	not(eq(assetTable.assetType, 'badges')),
	not(eq(assetTable.assetType, 'meshes')),
	eq(assetTable.moderationstate, 'approved'),
	eq(assetTable.onsale, true)
) // library assets
