import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { gamesTable, placesTable } from '$lib/server/schema/games'
import { desc, eq, count } from 'drizzle-orm'
import { redirect } from '@sveltejs/kit'
import { getPageNumber } from '$lib/utils'
import { gameCardSearch } from '$lib/server/games/gamecard'

export const load: PageServerLoad = async ({ params, url }) => {
	if (params.type !== 'popular' && params.type !== 'newest') {
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
			orderBy: [desc(gamesTable.active)],
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
			orderBy: [desc(gamesTable.updated)],
			limit: size,
			offset: (page - 1) * size
		})

		return { games: newestGames, name: 'Newest', gamesCount: gamesCount.count, type: friendlyType }
	}

	return { games: [], name: '', gamesCount: gamesCount.count, type: friendlyType }
}
