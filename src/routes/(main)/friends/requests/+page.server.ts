import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db } from '$src/lib/server/db'
import { relationsTable, usersTable } from '$lib/server/schema'
import { desc, eq, count, and } from 'drizzle-orm'
import { getUserState } from '$lib/server/userState'

export const load: PageServerLoad = async ({ locals }) => {
	const user = await db.query.usersTable.findFirst({
		columns: {},
		where: eq(usersTable.userid, locals.user.userid),
		with: {
			received: {
				columns: {},
				with: {
					sender: {
						columns: {
							username: true,
							userid: true,
							lastactivetime: true,
							activegame: true
						}
					}
				},
				where: eq(relationsTable.type, 'request'),
				limit: 18,
				orderBy: desc(relationsTable.time)
			}
		}
	})

	const requestCount = await db
		.select({ count: count() })
		.from(relationsTable)
		.where(
			and(eq(relationsTable.recipient, locals.user.userid), eq(relationsTable.type, 'request'))
		)
		.limit(1)

	if (!user) {
		error(404, { success: false, message: 'User not found!' })
	}

	const requests = user.received.map((request) => {
		const status = getUserState(request.sender.lastactivetime, request.sender.activegame)
		return { ...request, status }
	})

	return {
		requests,
		requestCount: requestCount[0].count
	}
}
