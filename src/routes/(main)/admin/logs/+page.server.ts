import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { count, desc } from 'drizzle-orm'
import { adminLogsTable } from '$lib/server/schema/users'
import { getPageNumber } from '$lib/utils'

export const load: PageServerLoad = async ({ url }) => {
	let page = getPageNumber(url)

	let size = 30

	const logsCount = await db.select({ count: count() }).from(adminLogsTable).limit(1)

	if (logsCount[0].count < (page - 1) * size) {
		page = 1
	}

	let logs = await db.query.adminLogsTable.findMany({
		with: {
			admin: {
				columns: {
					username: true
				}
			},
			game: {
				columns: {
					gamename: true
				}
			},
			asset: {
				columns: {
					assetType: true,
					assetname: true
				}
			}
		},
		orderBy: desc(adminLogsTable.time),
		limit: size,
		offset: (page - 1) * size
	})

	return {
		logs,
		logsCount
	}
}
