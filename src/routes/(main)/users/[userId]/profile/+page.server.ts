import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db } from '$src/lib/server/db'
import {
	relationsTable,
	usersTable,
	gamesTable,
	placesTable,
	assetFavoritesTable,
	assetTable
} from '$src/lib/server/schema'
import { and, count, desc, eq, or, sum } from 'drizzle-orm'
import { z } from 'zod'
import type { HexagonBadges, userState } from '$lib/types'
import { getUserState } from '$lib/server/userState'
import { getPageNumber } from '$lib/utils'
import { imageSql, aliasedimageSql } from '$lib/server/games/getImage'
import { alias } from 'drizzle-orm/pg-core'

async function addBadge(userId: number, badge: HexagonBadges, badges: string[]) {
	if (badges.includes(badge)) {
		return
	}

	badges.push(badge)

	await db.update(usersTable).set({ sitebadges: badges }).where(eq(usersTable.userid, userId))
}

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
			blurb: true,
			sitebadges: true,
			wipeouts: true,
			knockouts: true
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
					placeid: true,
					placename: true
				}
			}
		}
	})

	if (!user) {
		error(404, { success: false, message: 'User not found!' })
	}

	if (user.knockouts >= 10) {
		await addBadge(Number(params.userId), 'combat initiation', user.sitebadges)

		if (user.knockouts >= 100) {
			await addBadge(Number(params.userId), 'warrior', user.sitebadges)

			if (user.knockouts >= 250 && user.knockouts > user.wipeouts) {
				await addBadge(Number(params.userId), 'bloxxer', user.sitebadges)
			}
		}
	}

	const admin = user.role === 'admin' || user.role === 'mod' || user.role === 'owner'

	if (user.sitebadges.includes('admin') && !admin) {
		// remove they badge

		user.sitebadges = user.sitebadges.filter((badge) => badge !== 'admin')

		await db
			.update(usersTable)
			.set({ sitebadges: user.sitebadges })
			.where(eq(usersTable.userid, Number(params.userId)))
	}

	if (admin) {
		await addBadge(Number(params.userId), 'admin', user.sitebadges)
	}

	if (user.joindate) {
		const oneYearAgo = new Date()
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

		if (user.joindate <= oneYearAgo) {
			await addBadge(Number(params.userId), 'veteran', user.sitebadges)
		}
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

	const sizeFriends = 8

	if (friendsCount[0].count < (pageFriends - 1) * sizeFriends) {
		pageFriends = 1
	}

	if (friendsCount[0].count >= 20) {
		await addBadge(Number(params.userId), 'friendship', user.sitebadges)
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

	if (Number(placeVisits[0].count) >= 100) {
		await addBadge(Number(params.userId), 'homestead', user.sitebadges)

		if (Number(placeVisits[0].count) >= 1000) {
			await addBadge(Number(params.userId), 'bricksmith', user.sitebadges)
		}
	}

	let page = getPageNumber(url, 'places')

	const size = 10

	if (placeVisits[0].amount < (page - 1) * size) {
		page = 1
	}

	const places = await db.query.gamesTable.findMany({
		columns: {
			visits: true,
			description: true
		},
		orderBy: [desc(gamesTable.visits), desc(gamesTable.active)],
		limit: size,
		offset: (page - 1) * size,
		with: {
			places: {
				columns: {
					placeid: true,
					placename: true
				},
				where: eq(placesTable.startplace, true),
				limit: 1
			},
			thumbnail: {
				columns: {
					moderationstate: true
				},
				extras: {
					simpleasseturl: imageSql
				}
			}
		},
		where: eq(gamesTable.creatoruserid, Number(params.userId))
	})

	let favoritePage = getPageNumber(url, 'favorites')

	const favoriteSize = 6

	const favoritesCount = await db
		.select({ count: count() })
		.from(assetFavoritesTable)
		.leftJoin(assetTable, eq(assetTable.assetid, assetFavoritesTable.assetid))
		.where(
			and(eq(assetFavoritesTable.userid, Number(params.userId)), eq(assetTable.assetType, 'games'))
		)
		.limit(1)

	const icon = alias(assetTable, 'icon')

	const favorites = await db // i would of rather done all of this in a query but drizzle doesnt have aggregations supported yet
		.select({
			assetid: assetFavoritesTable.assetid,
			assetname: assetTable.assetname,
			creatoruserid: assetTable.creatoruserid,
			creatorusername: usersTable.username,
			simpleasseturl: aliasedimageSql(icon),
			moderationstate: icon.moderationstate
		})
		.from(assetFavoritesTable)
		.leftJoin(assetTable, eq(assetTable.assetid, assetFavoritesTable.assetid))
		.leftJoin(placesTable, eq(placesTable.placeid, assetTable.assetid))
		.leftJoin(gamesTable, eq(gamesTable.universeid, placesTable.universeid))
		.leftJoin(icon, eq(icon.assetid, gamesTable.iconid))
		.leftJoin(usersTable, eq(usersTable.userid, assetTable.creatoruserid))
		.where(
			and(eq(assetFavoritesTable.userid, Number(params.userId)), eq(assetTable.assetType, 'games'))
		)
		.limit(favoriteSize)
		.offset((favoritePage - 1) * favoriteSize)

	if (favoritesCount[0].count < (page - 1) * size) {
		favoritePage = 1
	}

	const status: userState = getUserState(user.lastactivetime, user.activegame)

	const relation = user.received

	return {
		username: user.username,
		userid: user.userid,
		lastactivetime: user.lastactivetime,
		joindate: user.joindate,
		role: user.role,
		badges: user.sitebadges,
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
		blurb: user.blurb,
		favorites,
		favoritesCount: favoritesCount[0].count
	}
}
