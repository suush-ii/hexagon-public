import { eq } from 'drizzle-orm'
import { placesTable } from '$lib/server/schema'
import { db } from '../db'

export async function gameCardSearch(params: {}) {
	let games = await db.query.gamesTable.findMany({
		columns: {
			gamename: true,
			active: true,
			iconid: true
		},
		with: {
			places: {
				columns: {
					placeid: true
				},
				where: eq(placesTable.startplace, true),
				limit: 1
			},
			icon: {
				columns: {
					simpleasseturl: true,
					moderationstate: true
				}
			}
		},
		...params
	})

	games = games.map((game) => {
		// strip the asseturl from the client if not approved
		if (game.icon && game.icon.moderationstate !== 'approved') {
			game.icon.simpleasseturl = null
		}
		return game
	})

	return games
}
