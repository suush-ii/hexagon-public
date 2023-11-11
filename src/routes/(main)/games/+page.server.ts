import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { gamesTable } from '$lib/server/schema/games'
import { desc } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
	const result = await db.select().from(gamesTable).limit(40).orderBy(desc(gamesTable.active))

	return { games: result }
}
