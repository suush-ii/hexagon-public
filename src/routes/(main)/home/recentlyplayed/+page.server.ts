import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { gamesTable, placesTable } from '$lib/server/schema/games'
import { desc, eq, and } from 'drizzle-orm'
import { assetTable, recentlyPlayedTable } from '$lib/server/schema'
import { imageSql } from '$lib/server/games/getImage'
import { activeSql } from '$lib/server/games/activeSql'

export const load: PageServerLoad = async ({ locals }) => {
	let recentlyPlayed = await db
		.select({
			active: activeSql,
			icon: { moderationstate: assetTable.moderationstate, simpleasseturl: imageSql },
			place: {
				placeid: placesTable.placeid,
				placename: placesTable.placename
			}
		})
		.from(recentlyPlayedTable)
		.innerJoin(gamesTable, eq(gamesTable.universeid, recentlyPlayedTable.gameid))
		.leftJoin(assetTable, eq(assetTable.assetid, gamesTable.iconid))
		.innerJoin(
			placesTable,
			and(eq(placesTable.universeid, gamesTable.universeid), eq(placesTable.startplace, true))
		)
		.where(eq(recentlyPlayedTable.userid, locals.user.userid))
		.limit(30)
		.orderBy(desc(recentlyPlayedTable.time))

	return { recentlyPlayed }
}
