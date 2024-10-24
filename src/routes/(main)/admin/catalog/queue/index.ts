import { assetTable } from '$src/lib/server/schema'
import { and, eq, ne } from 'drizzle-orm'

export const filter = and(
	eq(assetTable.moderationstate, 'pending'),
	ne(assetTable.assetType, 'shirts'),
	ne(assetTable.assetType, 'pants'),
	ne(assetTable.assetType, 'decals'),
	ne(assetTable.assetType, 't-shirts'),
	ne(assetTable.assetType, 'badges'),
	ne(assetTable.assetType, 'gamepasses')
)
