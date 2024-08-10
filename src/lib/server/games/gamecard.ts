import { eq, sql } from 'drizzle-orm'
import { placesTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { imageSql } from './getImage'

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
					moderationstate: true
				},
				extras: {
					simpleasseturl: imageSql
				}
			}
		},
		...params
	})

	return games
}
