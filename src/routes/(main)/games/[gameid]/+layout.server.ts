import type { LayoutServerLoad } from './$types'
import { placesTable } from '$lib/server/schema/games'
import { db } from '$lib/server/db'
import { eq, and } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { votesTable } from '$lib/server/schema/gamevotes'
import { jobsTable } from '$lib/server/schema/games'
import { slugify } from '$lib/utils'
type jobs = typeof jobsTable.$inferSelect

export const load: LayoutServerLoad = async ({ params, locals, depends, cookies, url }) => {
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
					thumbnailurl: true,
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

	if (params?.game !== slugGameName) {
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
		ticket: cookies.get('auth_session') ?? '',
		servers
	}
}
