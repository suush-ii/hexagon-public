import { db } from '$lib/server/db'
import { jobsTable } from '$src/lib/server/schema'
import { json, type RequestHandler } from '@sveltejs/kit'
import { sum } from 'drizzle-orm'

export const GET: RequestHandler = async () => {
	const [games] = await db
		.select({
			active: sum(jobsTable.active)
		})
		.from(jobsTable)
		.limit(1)

	return json({ success: true, message: '', data: { players: Number(games.active ?? 0) } })
}
