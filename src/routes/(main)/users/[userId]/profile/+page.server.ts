import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db } from '$src/lib/server/db'
import { relationsTable, usersTable } from '$src/lib/server/schema/users'
import { and, count, eq, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import type { userState } from '$lib/types'
import { getUserState } from '$lib/server/userState'

export const load: PageServerLoad = async ({ params, locals }) => {
	const result = await z.number().safeParseAsync(Number(params.userId))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const user = await db.query.usersTable.findFirst({
		columns: {
			username: true,
			userid: true,
			lastactivetime: true,
			joindate: true,
			activegame: true
		},
		where: eq(usersTable.userid, Number(params.userId)),
		with: {
			sent: {
				columns: {
					type: true
				},
				where: or(
					and(
						eq(relationsTable.sender, locals.user.userid),
						eq(relationsTable.recipient, Number(params.userId))
					),
					eq(relationsTable.type, 'friend'),
					eq(relationsTable.type, 'block'),
					eq(relationsTable.type, 'request')
				),
				limit: 1
			},
			received: {
				columns: {
					type: true
				},
				where: or(
					and(
						eq(relationsTable.recipient, locals.user.userid),
						eq(relationsTable.sender, Number(params.userId))
					),
					eq(relationsTable.type, 'friend'),
					eq(relationsTable.type, 'block'),
					eq(relationsTable.type, 'request')
				),
				limit: 1
			},
			activegame: {
				columns: {
					placeid: true
				},
				with: {
					associatedgame: {
						columns: {
							gamename: true
						}
					}
				}
			}
		}
	})

	const followersCount = await db
		.select({ count: count() })
		.from(relationsTable)
		.where(
			and(eq(relationsTable.recipient, Number(params.userId)), eq(relationsTable.type, 'follow'))
		)
		.limit(1)

	const friendsCount = await db
		.select({ count: count() })
		.from(relationsTable)
		.where(
			and(
				or(
					eq(relationsTable.recipient, Number(params.userId)),
					eq(relationsTable.sender, Number(params.userId))
				),
				eq(relationsTable.type, 'friend')
			)
		)
		.limit(1)

	const followingCount = await db
		.select({ count: count() })
		.from(relationsTable)
		.where(and(eq(relationsTable.sender, Number(params.userId)), eq(relationsTable.type, 'follow')))
		.limit(1)

	const isFollowing = await db
		.select({})
		.from(relationsTable)
		.where(
			and(
				eq(relationsTable.recipient, Number(params.userId)),
				eq(relationsTable.sender, locals.user.userid),
				eq(relationsTable.type, 'follow')
			)
		)
		.limit(1)

	if (user) {
		const status: userState = getUserState(user.lastactivetime, user.activegame)

		const relation = user.sent.concat(user.received)

		return {
			username: user.username,
			userid: user.userid,
			lastactivetime: user.lastactivetime,
			joindate: user.joindate,
			status,
			activegame: user.activegame,
			relation: relation,
			followersCount: followersCount[0].count,
			followingCount: followingCount[0].count,
			friendsCount: friendsCount[0].count,
			isFollowing: isFollowing.length > 0
		}
	}

	error(404, { success: false, message: 'User not found!' })
}
