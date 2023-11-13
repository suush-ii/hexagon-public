import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { gamesTable } from '$lib/server/schema/games'
import { desc } from 'drizzle-orm'

export const load: PageServerLoad = async ({}) => {
	const populargames = await db
		.select({
			gameid: gamesTable.gameid,
			gamename: gamesTable.gamename,
			active: gamesTable.active,
			iconurl: gamesTable.iconurl
		})
		.from(gamesTable)
		.limit(40)
		.orderBy(desc(gamesTable.active))

	return { popular: populargames }
}
