import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { gamesTable, placesTable } from '$lib/server/schema/games'
import { desc, eq, count } from 'drizzle-orm'
import { redirect } from '@sveltejs/kit'
import { getPageNumber } from '$lib/utils'

export const load: PageServerLoad = async ({ params, url }) => {
	if (params.type !== 'popular' && params.type !== 'newest') {
		redirect(302, '/games')
	}

	const [gamesCount] = await db.select({ count: count() }).from(gamesTable).limit(1)

	let page = getPageNumber(url)

	let size = 40

	if (gamesCount.count < (page - 1) * size) {
		page = 1
	}

	if (params.type === 'popular') {
		const popularGames = await db.query.gamesTable.findMany({
			columns: {
				gamename: true,
				active: true,
				iconid: true
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
			}
		})

		return { games: popularGames, name: 'Popular', gamesCount: gamesCount.count }
	}

	if (params.type === 'newest') {
		const newestGames = await db.query.gamesTable.findMany({
			columns: {
				gamename: true,
				active: true,
				iconid: true
			},
			orderBy: [desc(gamesTable.updated)],
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
			}
		})

		return { games: newestGames, name: 'Newest', gamesCount: gamesCount.count }
	}

	return { games: [], name: '', gamesCount: gamesCount.count }
}
