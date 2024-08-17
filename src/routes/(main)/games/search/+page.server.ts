import type { PageServerLoad } from './$types'
import { assetGenreZod as genres } from '$lib'
import { getPageNumber } from '$lib/utils'
import { db } from '$lib/server/db'
import { and, count, desc, eq, ilike } from 'drizzle-orm'
import { gamesTable, placesTable } from '$lib/server/schema'
import { gameCardSearch } from '$lib/server/games/gamecard'

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search') ?? ''
	const genre = genres.find((o) => o === url.searchParams.get('genre')) ?? genres[0]

	let page = getPageNumber(url)

	const size = 40

	const [gamesCount] = await db
		.select({ count: count() })
		.from(gamesTable)
		.where(and(ilike(gamesTable.gamename, `%${search}%`), eq(gamesTable.genre, genre)))
		.limit(1)

	if (gamesCount.count < (page - 1) * size) {
		page = 1
	}

	const games = await gameCardSearch({
		orderBy: [desc(gamesTable.active)],
		limit: size,
		offset: (page - 1) * size,
		where: and(ilike(gamesTable.gamename, `%${search}%`), eq(gamesTable.genre, genre))
	})

	return {
		games,
		gamesCount: gamesCount.count
	}
}
