import type { PageServerLoad } from './$types'
import { gamesTable } from '$lib/server/schema/games'
import { desc, eq } from 'drizzle-orm'
import { gameCardSearch } from '$lib/server/games/gamecard'

export const load: PageServerLoad = async ({}) => {
	const popularGames = await gameCardSearch({
		orderBy: desc(gamesTable.active),
		limit: 40
	})

	const newestGames = await gameCardSearch({
		orderBy: desc(gamesTable.updated),
		limit: 40
	})

	const topRatedGames = await gameCardSearch({
		orderBy: desc(gamesTable.likes),
		limit: 40
	})

	const originalGames = await gameCardSearch({
		orderBy: (desc(gamesTable.active), desc(gamesTable.updated)),
		where: eq(gamesTable.original, true),
		limit: 40
	})

	return {
		popular: popularGames,
		newest: newestGames,
		topRated: topRatedGames,
		original: originalGames
	}
}
