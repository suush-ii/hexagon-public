import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db } from '$src/lib/server/db'
import { relationsTable, usersTable, gamesTable, placesTable } from '$src/lib/server/schema'
import { and, count, desc, eq, or, sum } from 'drizzle-orm'
import { z } from 'zod'
import type { userState } from '$lib/types'
import { getUserState } from '$lib/server/userState'
import { getPageNumber } from '$lib/utils'

export const load: PageServerLoad = async ({ params, locals, url }) => {
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

	if (!user) {
		error(404, { success: false, message: 'User not found!' })
	}

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

	const friends = await db.query.relationsTable.findMany({
		columns: {},
		where: and(
			or(
				eq(relationsTable.recipient, Number(params.userId)),
				eq(relationsTable.sender, Number(params.userId))
			),
			eq(relationsTable.type, 'friend')
		),
		with: {
			recipient: {
				columns: {
					userid: true,
					username: true
				}
			}
		}
	})

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

	const placeVisits = await db
		.select({ count: sum(gamesTable.visits), amount: count() })
		.from(gamesTable)
		.where(eq(gamesTable.creatoruserid, Number(params.userId)))
		.limit(1)

	let page = getPageNumber(url, 'places')

	let size = 10

	if (placeVisits[0].amount < (page - 1) * size) {
		page = 1
	}

	const places = await db.query.gamesTable.findMany({
		columns: {
			gamename: true,
			thumbnailurl: true,
			visits: true,
			description: true
		},
		orderBy: [desc(gamesTable.active)],
		limit: size,
		with: {
			places: {
				columns: {
					placeid: true
				},
				where: eq(placesTable.startplace, true),
				limit: 1
			}
		},
		where: eq(gamesTable.creatoruserid, Number(params.userId))
	})

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
		isFollowing: isFollowing.length > 0,
		placeVisits: placeVisits[0].count ?? 0,
		places,
		placeCount: placeVisits[0].amount
	}
}
