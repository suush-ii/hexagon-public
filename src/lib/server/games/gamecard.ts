import { eq, sql } from 'drizzle-orm'
import { gamesTable, placesTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { imageSql } from './getImage'

export async function gameCardSearch(params: {}) {
	const games = await db.query.gamesTable.findMany({
		columns: {
			active: true,
			iconid: true
		},
		with: {
			places: {
				columns: {
					placeid: true,
					placename: true
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
