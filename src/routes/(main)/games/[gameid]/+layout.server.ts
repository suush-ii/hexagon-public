import type { LayoutServerLoad } from './$types'
import { placesTable } from '$lib/server/schema/games'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'

export const load: LayoutServerLoad = async ({ params }) => {
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
					thumbnailurl: true
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

	return { place: place }
}
