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
	not(eq(assetTable.assetType, 'models')),
	eq(assetTable.moderationstate, 'approved'),
	eq(assetTable.onsale, true)
) // library assets

export const commonWhereLibrary = and(
	not(eq(assetTable.assetType, 'games')),
	not(eq(assetTable.assetType, 'hats')),
	not(eq(assetTable.assetType, 'shirts')),
	not(eq(assetTable.assetType, 'pants')),
	not(eq(assetTable.assetType, 'gamepasses')),
	not(eq(assetTable.assetType, 'badges')),
	not(eq(assetTable.assetType, 'meshes')),
	not(eq(assetTable.assetType, 'packages')),
	not(eq(assetTable.assetType, 'gears')),
	not(eq(assetTable.assetType, 'faces')),
	not(eq(assetTable.assetType, 'images')),
	not(eq(assetTable.assetType, 't-shirts')),
	eq(assetTable.moderationstate, 'approved'),
	eq(assetTable.onsale, true)
) // library assets
