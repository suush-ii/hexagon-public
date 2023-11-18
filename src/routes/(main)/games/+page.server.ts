import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { gamesTable, placesTable } from '$lib/server/schema/games'
import { desc, eq } from 'drizzle-orm'

export const load: PageServerLoad = async ({}) => {
	const popularGames = await db.query.gamesTable.findMany({
		columns: {
			gamename: true,
			active: true,
			iconurl: true
		},
		orderBy: [desc(gamesTable.active)],
		limit: 40,
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

	const newestGames = await db.query.gamesTable.findMany({
		columns: {
			gamename: true,
			active: true,
			iconurl: true
		},
		orderBy: [desc(gamesTable.updated)],
		limit: 40,
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

	return { popular: popularGames, newest: newestGames }
}
