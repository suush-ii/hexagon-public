import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { gamesTable, placesTable } from '$lib/server/schema/games'
import { desc, eq, count, sql } from 'drizzle-orm'
import { redirect } from '@sveltejs/kit'
import { getPageNumber } from '$lib/utils'
import { gameCardSearch } from '$lib/server/games/gamecard'

export const load: PageServerLoad = async ({ params, url }) => {
	if (
		params.type !== 'popular' &&
		params.type !== 'newest' &&
		params.type !== 'toprated' &&
		params.type !== 'original'
	) {
		redirect(302, '/games')
	}

	const [gamesCount] = await db.select({ count: count() }).from(gamesTable).limit(1)

	let page = getPageNumber(url)

	const size = 40

	if (gamesCount.count < (page - 1) * size) {
		page = 1
	}

	const friendlyType = params.type.charAt(0).toUpperCase() + params.type.slice(1)

	if (params.type === 'popular') {
		const popularGames = await gameCardSearch({
			orderBy: desc(sql`active`),
			limit: size,
			offset: (page - 1) * size
		})

		return {
			games: popularGames,
			name: 'Popular',
			gamesCount: gamesCount.count,
			type: friendlyType
		}
	}

	if (params.type === 'newest') {
		const newestGames = await gameCardSearch({
			orderBy: desc(gamesTable.updated),
			limit: size,
			offset: (page - 1) * size
		})

		return { games: newestGames, name: 'Newest', gamesCount: gamesCount.count, type: friendlyType }
	}

	if (params.type === 'toprated') {
		const topRatedGames = await gameCardSearch({
			orderBy: desc(gamesTable.likes),
			limit: size,
			offset: (page - 1) * size
		})

		return {
			games: topRatedGames,
			name: 'Top Rated',
			gamesCount: gamesCount.count,
			type: friendlyType
		}
	}

	if (params.type === 'original') {
		const [gamesCount] = await db
			.select({ count: count() })
			.from(gamesTable)
			.limit(1)
			.where(eq(gamesTable.original, true))

		const originalGames = await gameCardSearch({
			orderBy: desc(sql`active`),
			where: eq(gamesTable.original, true),
			limit: size,
			offset: (page - 1) * size
		})

		return {
			games: originalGames,
			name: 'Original Games on Hexagon',
			gamesCount: gamesCount.count,
			type: friendlyType
		}
	}

	return { games: [], name: '', gamesCount: gamesCount.count, type: friendlyType }
}
