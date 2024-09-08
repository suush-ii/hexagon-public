import { and, eq, SQL } from 'drizzle-orm'
import { assetTable, gamesTable, placesTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { imageSql } from './getImage'
import { alias } from 'drizzle-orm/pg-core'

export async function gameCardSearch(params: {
	orderBy: SQL<unknown>
	limit: number
	offset?: number
}) {
	const associatedAsset = alias(assetTable, 'associatedasset')

	const games = await db
		.select({
			active: gamesTable.active,
			icon: { moderationstate: assetTable.moderationstate, simpleasseturl: imageSql },
			place: {
				placeid: placesTable.placeid,
				placename: placesTable.placename
			}
		})
		.from(gamesTable)
		.limit(params.limit)
		.offset(params.offset ?? 0)
		.orderBy(params.orderBy)
		.leftJoin(assetTable, eq(assetTable.assetid, gamesTable.iconid))
		.innerJoin(
			placesTable,
			and(eq(placesTable.universeid, gamesTable.universeid), eq(placesTable.startplace, true))
		)
		.innerJoin(associatedAsset, eq(associatedAsset.assetid, placesTable.placeid))
		.where(eq(associatedAsset.moderationstate, 'approved'))

	return games
}
