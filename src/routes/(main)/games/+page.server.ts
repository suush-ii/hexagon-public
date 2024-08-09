import type { PageServerLoad } from './$types'
import { gamesTable } from '$lib/server/schema/games'
import { desc } from 'drizzle-orm'
import { gameCardSearch } from '$lib/server/games/gamecard'

export const load: PageServerLoad = async ({}) => {
	const popularGames = await gameCardSearch({
		orderBy: [desc(gamesTable.active)],
		limit: 40
	})

	const newestGames = await gameCardSearch({
		orderBy: [desc(gamesTable.updated)],
		limit: 40
	})

	return { popular: popularGames, newest: newestGames }
}
