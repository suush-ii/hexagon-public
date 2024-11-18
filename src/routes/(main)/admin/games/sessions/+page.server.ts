import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { count, desc, eq } from 'drizzle-orm'
import { adminLogsTable } from '$lib/server/schema/users'
import { getPageNumber } from '$lib/utils'
import { gamesessionsTable, placesTable } from '$lib/server/schema/games.js'

export const load: PageServerLoad = async ({ url }) => {
	let page = getPageNumber(url)

	const size = 30

	const logsCount = await db.select({ count: count() }).from(gamesessionsTable).limit(1)

	if (logsCount[0].count < (page - 1) * size) {
		page = 1
	}

	const logs = await db.query.gamesessionsTable.findMany({
		orderBy: desc(gamesessionsTable.time),
		limit: size,
		offset: (page - 1) * size
	})

	return {
		logs,
		logsCount
	}
}
