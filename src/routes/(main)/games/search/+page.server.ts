import type { PageServerLoad } from './$types'
import { assetGenreZod as genres } from '$lib'
import { getPageNumber } from '$lib/utils'
import { db } from '$lib/server/db'
import { and, count, desc, eq, ilike } from 'drizzle-orm'
import { assetTable, gamesTable, placesTable } from '$lib/server/schema'
import { imageSql } from '$lib/server/games/getImage'

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search') ?? ''
	const genre = genres.find((o) => o === url.searchParams.get('genre')) ?? genres[0]

	let page = getPageNumber(url)

	const size = 40

	const [gamesCount] = await db
		.select({ count: count() })
		.from(gamesTable)
		.leftJoin(
			placesTable,
			and(eq(placesTable.universeid, gamesTable.universeid), eq(placesTable.startplace, true))
		)
		.where(and(ilike(placesTable.placename, `%${search}%`), eq(gamesTable.genre, genre)))
		.limit(1)

	console.log(gamesCount)

	if (gamesCount.count < (page - 1) * size) {
		page = 1
	}

	const games = await db
		.select({
			active: gamesTable.active,
			iconid: gamesTable.iconid,
			places: { placeid: placesTable.placeid, placename: placesTable.placename },
			icon: { moderationstate: assetTable.moderationstate, simpleasseturl: imageSql }
		})
		.from(gamesTable)
		.innerJoin(
			placesTable,
			and(eq(placesTable.universeid, gamesTable.universeid), eq(placesTable.startplace, true))
		)
		.leftJoin(assetTable, eq(assetTable.assetid, gamesTable.iconid))
		.where(and(ilike(placesTable.placename, `%${search}%`), eq(gamesTable.genre, genre)))
		.limit(size)
		.offset((page - 1) * size)
		.orderBy(desc(gamesTable.active))

	return {
		games,
		gamesCount: gamesCount.count
	}
}
