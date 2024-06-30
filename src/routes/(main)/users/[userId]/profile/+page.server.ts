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
			activegame: true,
			role: true,
			blurb: true
		},
		where: eq(usersTable.userid, Number(params.userId)),
		with: {
			received: {
				columns: {
					type: true
				},
				where: and(
					eq(relationsTable.sender, locals.user.userid),
					eq(relationsTable.recipient, Number(params.userId)),
					or(
						eq(relationsTable.type, 'friend'),
						eq(relationsTable.type, 'block'),
						eq(relationsTable.type, 'request')
					)
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
			and(eq(relationsTable.type, 'friend'), eq(relationsTable.recipient, Number(params.userId)))
		)
		.limit(1)

	let pageFriends = getPageNumber(url, 'friends')

	let sizeFriends = 8

	if (friendsCount[0].count < (pageFriends - 1) * sizeFriends) {
		pageFriends = 1
	}

	const friendsUser = await db.query.relationsTable.findMany({
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
		where: and(
			eq(relationsTable.type, 'friend'),
			eq(relationsTable.recipient, Number(params.userId))
		),
		limit: sizeFriends,
		offset: (pageFriends - 1) * sizeFriends,
		orderBy: desc(relationsTable.time)
	})

	const friends = friendsUser?.map((request) => {
		const status = getUserState(request.sender.lastactivetime, request.sender.activegame)
		return { ...request, status }
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
			thumbnailid: true,
			visits: true,
			description: true
		},
		orderBy: [desc(gamesTable.active)],
		limit: size,
		offset: (page - 1) * size,
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

	const relation = user.received

	return {
		username: user.username,
		userid: user.userid,
		lastactivetime: user.lastactivetime,
		joindate: user.joindate,
		role: user.role,
		status,
		activegame: user.activegame,
		relation: relation,
		followersCount: followersCount[0].count,
		followingCount: followingCount[0].count,
		friendsCount: friendsCount[0].count,
		isFollowing: isFollowing.length > 0,
		placeVisits: placeVisits[0].count ?? 0,
		places,
		placeCount: placeVisits[0].amount,
		friends,
		blurb: user.blurb
	}
}
