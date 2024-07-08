import type { LayoutServerLoad } from './$types'
import { gamesTable, placesTable } from '$lib/server/schema/games'
import { db } from '$lib/server/db'
import { eq, and, count, desc, ne } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { votesTable } from '$lib/server/schema/gamevotes'
import { jobsTable } from '$lib/server/schema/games'
import { slugify } from '$lib/utils'
type jobs = typeof jobsTable.$inferSelect
import { env } from '$env/dynamic/private'
import { assetFavoritesTable } from '$src/lib/server/schema'
const joinScriptUrl = `http://${env.BASE_URL}/game/Join.ashx`

export const load: LayoutServerLoad = async ({
	params,
	locals,
	depends,
	request,
	url,
	cookies
}) => {
	const result = await z.number().safeParseAsync(Number(params.gameid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, Number(params.gameid)),
		with: {
			associatedgame: {
				columns: {
					gamename: true,
					active: true,
					visits: true,
					serversize: true,
					updated: true,
					creatoruserid: true,
					description: true,
					thumbnailid: true,
					genre: true,
					likes: true,
					dislikes: true,
					universeid: true
				},
				with: {
					author: {
						columns: {
							username: true
						}
					}
				}
			}
		}
	})

	if (!place) {
		error(404, { success: false, message: 'Game not found.', data: {} })
	}

	const slugGameName = slugify(place.associatedgame.gamename)

	if (params?.game !== slugGameName && slugGameName !== '') {
		redirect(302, '/games/' + Number(params.gameid) + '/' + slugGameName)
	}

	const alreadyVoted = await db
		.select()
		.from(votesTable)
		.where(
			and(
				eq(votesTable.userid, locals.user.userid),
				eq(votesTable.gameid, Number(place.associatedgame.universeid))
			)
		)
		.limit(1)

	depends('app:game')

	let servers: Pick<jobs, 'jobid' | 'active' | 'players'>[] = []

	if (url.searchParams.get('page') === 'servers') {
		servers = await db
			.select({ jobid: jobsTable.jobid, active: jobsTable.active, players: jobsTable.players })
			.from(jobsTable)
			.where(eq(jobsTable.associatedid, place.associatedgame.universeid))
			.limit(40) // TODO: ADD PAGINATION
	}

	let canEdit = Number(locals.user.userid) === place.associatedgame.creatoruserid

	const favorites = await db
		.select({ count: count() })
		.from(assetFavoritesTable)
		.where(eq(assetFavoritesTable.assetid, Number(params.gameid)))
		.limit(1)

	const alreadyFavorited = await db
		.select()
		.from(assetFavoritesTable)
		.where(
			and(
				eq(assetFavoritesTable.userid, locals.user.userid),
				eq(assetFavoritesTable.assetid, place.placeid)
			)
		)
		.limit(1)

	let recommendations = await db.query.gamesTable.findMany({
		where: ne(gamesTable.universeid, place.associatedgame.universeid),
		columns: {
			gamename: true,
			active: true,
			iconid: true
		},
		with: {
			places: {
				where: eq(placesTable.startplace, true),
				limit: 1,
				columns: {
					placeid: true
				}
			}
		},
		limit: 8,
		orderBy: desc(gamesTable.active) // first order by active players, then randomize that
	})

	recommendations = recommendations
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)

	let authBearer = cookies.get('.ROBLOSECURITY') ?? ''

	return {
		place: place,
		likespercentage: Math.round(
			(place.associatedgame.likes / (place.associatedgame.likes + place.associatedgame.dislikes)) *
				100
		), // (likes / total of likes and dislikes) times 100 rounded
		alreadyVoted: {
			voted: alreadyVoted.length > 0,
			voteType: alreadyVoted.length > 0 ? alreadyVoted[0].type : null
		},
		alreadyFavorited: alreadyFavorited.length > 0,
		favorites: favorites[0].count,
		servers,
		joinScriptUrl,
		canEdit,
		userAgent: request.headers.get('user-agent'),
		recommendations,
		authBearer,
		baseurl: env.BASE_URL
	}
}
