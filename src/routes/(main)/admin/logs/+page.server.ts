import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { and, count, desc, eq } from 'drizzle-orm'
import { adminLogsTable, usersTable } from '$lib/server/schema/users'
import { getPageNumber } from '$lib/utils'
import { placesTable } from '$lib/server/schema/games.js'
import { z } from 'zod'
import { friendlyActionNames, actionTypes } from '$lib/server/admin'
import type { ActionTypes } from '$lib/server/admin'

export const load: PageServerLoad = async ({ url }) => {
	let page = getPageNumber(url)

	const size = 30

	let user: string | number = url.searchParams.get('user') ?? 'all'

	let action: ActionTypes | 'all'

	const result = await z.coerce.number().safeParseAsync(user)

	const resultAction = await z.enum(actionTypes).safeParseAsync(url.searchParams.get('action'))

	if (!result.success) {
		user = 'all'
	} else {
		user = result.data
	}

	if (!resultAction.success) {
		action = 'all'
	} else {
		action = resultAction.data
	}

	const where = user !== 'all' ? eq(adminLogsTable.userid, Number(user)) : undefined

	const whereAction = action !== 'all' ? eq(adminLogsTable.action, action) : undefined

	const logsCount = await db
		.select({ count: count() })
		.from(adminLogsTable)
		.limit(1)
		.where(and(where, whereAction))

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
			},
			movedItem: {
				columns: {
					assetname: true,
					assetid: true
				}
			},
			movedToUser: {
				columns: {
					username: true,
					userid: true
				}
			},
			deletedItem: {
				columns: {
					assetname: true,
					assetid: true
				}
			}
		},
		orderBy: desc(adminLogsTable.time),
		limit: size,
		offset: (page - 1) * size,
		where: and(where, whereAction)
	})

	const users = await db
		.selectDistinctOn([adminLogsTable.userid], {
			userid: adminLogsTable.userid,
			username: usersTable.username
		})
		.from(adminLogsTable)
		.innerJoin(usersTable, eq(usersTable.userid, adminLogsTable.userid))
		.limit(30)

	return {
		logs,
		logsCount,
		users,
		actionTypes: friendlyActionNames
	}
}
