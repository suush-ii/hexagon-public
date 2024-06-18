import type { PageServerLoad } from './$types'
import { assetGenreZod as genres } from '$lib'
import { getPageNumber } from '$lib/utils'
import { db } from '$lib/server/db'
import { and, count, desc, eq, ilike } from 'drizzle-orm'
import { gamesTable, placesTable } from '$lib/server/schema'

export const load: PageServerLoad = async ({ url }) => {
	let search = url.searchParams.get('search') ?? ''
	let genre = genres.find((o) => o === url.searchParams.get('genre')) ?? genres[0]

	let page = getPageNumber(url)

	let size = 40

	const [gamesCount] = await db
		.select({ count: count() })
		.from(gamesTable)
		.where(ilike(gamesTable.gamename, `%${search}%`))
		.limit(1)

	if (gamesCount.count < (page - 1) * size) {
		page = 1
	}

	const games = await db.query.gamesTable.findMany({
		columns: {
			gamename: true,
			active: true,
			iconid: true
		},
		orderBy: [desc(gamesTable.active)],
		limit: size,
		offset: (page - 1) * size,
		where: and(ilike(gamesTable.gamename, `%${search}%`), eq(gamesTable.genre, genre)),
		with: {
			places: {
				columns: {
					placeid: true
				},
				where: eq(placesTable.startplace, true),
				limit: 1
			}
		}
	})

	return {
		games,
		gamesCount: gamesCount.count
	}
}
