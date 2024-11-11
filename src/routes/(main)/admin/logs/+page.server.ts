import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { count, desc, eq } from 'drizzle-orm'
import { adminLogsTable } from '$lib/server/schema/users'
import { getPageNumber } from '$lib/utils'
import { placesTable } from '$lib/server/schema/games.js'

export const load: PageServerLoad = async ({ url }) => {
	let page = getPageNumber(url)

	const size = 30

	const logsCount = await db.select({ count: count() }).from(adminLogsTable).limit(1)

	if (logsCount[0].count < (page - 1) * size) {
		page = 1
	}

	const logs = await db.query.adminLogsTable.findMany({
		with: {
			admin: {
				columns: {
					username: true
				}
			},
			game: {
				columns: {},
				with: {
					places: {
						columns: {
							placename: true
						},
						where: eq(placesTable.startplace, true)
					}
				}
			},
			asset: {
				columns: {
					assetType: true,
					assetname: true
				}
			},
			user: {
				columns: {
					username: true
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
