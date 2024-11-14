import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { placesTable } from '$lib/server/schema/games'
import { desc, eq } from 'drizzle-orm'
import { recentlyPlayedTable } from '$src/lib/server/schema'
import { imageSql } from '$lib/server/games/getImage'

export const load: PageServerLoad = async ({ locals }) => {
	let recentlyPlayed = await db.query.recentlyPlayedTable.findMany({
		where: eq(recentlyPlayedTable.userid, locals.user.userid),
		orderBy: desc(recentlyPlayedTable.time),
		limit: 30,
		columns: {},
		with: {
			game: {
				columns: {
					active: true,
					iconid: true
				},
				with: {
					places: {
						where: eq(placesTable.startplace, true),
						limit: 1,
						columns: {
							placeid: true,
							placename: true
						}
					},
					icon: {
						columns: {
							moderationstate: true
						},
						extras: {
							simpleasseturl: imageSql
						}
					}
				}
			}
		}
	})

	return { recentlyPlayed }
}
