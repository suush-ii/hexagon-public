import type { LayoutServerLoad } from './$types'
import { placesTable } from '$lib/server/schema/games'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { votesTable } from '$lib/server/schema/gamevotes'

export const load: LayoutServerLoad = async ({ params, locals, depends }) => {
	const result = await z.number().safeParseAsync(Number(params.gameid))

	if (result.success === false) {
		throw error(400, { success: false, message: 'Malformed input.' })
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
					dislikes: true
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
		throw error(404, { success: false, message: 'Game not found.', data: {} })
	}

	if (params?.game !== place.associatedgame.gamename) {
		throw redirect(302, '/games/' + Number(params.gameid) + '/' + place.associatedgame.gamename)
	}

	const alreadyVoted = await db
		.select()
		.from(votesTable)
		.where(eq(votesTable.userid, locals.session.user.userid))
		.where(eq(votesTable.gameid, Number(params.gameid)))
		.limit(1)

	depends('app:game')

	return {
		place: place,
		likespercentage: Math.round(
			(place.associatedgame.likes / (place.associatedgame.likes + place.associatedgame.dislikes)) *
				100
		), // (likes / total of likes and dislikes) times 100 rounded
		alreadyVoted: {
			voted: alreadyVoted.length > 0,
			voteType: alreadyVoted.length > 0 ? alreadyVoted[0].type : null
		}
	}
}
