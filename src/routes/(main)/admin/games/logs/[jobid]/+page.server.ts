import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { count, desc, eq } from 'drizzle-orm'
import { getPageNumber } from '$lib/utils'
import { jobsTable, logsTable } from '$lib/server/schema/games.js'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ url, params }) => {
	let page = getPageNumber(url)

	const size = 30

	const logsCount = await db
		.select({ count: count() })
		.from(logsTable)
		.limit(1)
		.where(eq(logsTable.jobid, params.jobid))

	if (logsCount[0].count < (page - 1) * size) {
		page = 1
	}

	const logs = await db.query.logsTable.findMany({
		orderBy: desc(logsTable.time),
		limit: size,
		offset: (page - 1) * size,
		where: eq(logsTable.jobid, params.jobid),
		with: {
			user: {
				columns: {
					username: true,
					userid: true
				}
			}
		}
	})

	return {
		logs,
		logsCount
	}
}
