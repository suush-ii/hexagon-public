import { db } from '$lib/server/db'
import type { PageServerLoad } from './$types'
import { assetTable, gamesTable, placesTable } from '$lib/server/schema'
import { desc, eq } from 'drizzle-orm'
import { env } from '$env/dynamic/private'
import { imageSql } from '$lib/server/games/getImage'
export const csr = false

export const load: PageServerLoad = async (event) => {
	const filepath = event.url.searchParams.getAll('filepath')
	const filename = event.url.searchParams.getAll('filename')

	const files: { [key: string]: string } = {}
	for (let i = 0; i < filepath.length; i++) {
		files[filepath[i] || 'defaultPath'] = filename[i] || 'defaultName'
	}

	const session = event.locals

	if (session?.user) {
		const gamecreations = await db
			.select({
				placeid: placesTable.placeid,
				placename: placesTable.placename,
				thumbnail: { moderationstate: assetTable.moderationstate, simpleasseturl: imageSql }
			})
			.from(placesTable)
			.leftJoin(gamesTable, eq(gamesTable.universeid, placesTable.universeid))
			.leftJoin(assetTable, eq(assetTable.assetid, gamesTable.thumbnailid))
			.where(eq(gamesTable.creatoruserid, event.locals.user.userid))
			.limit(20)
			.orderBy(desc(gamesTable.updated))

		return {
			files,
			username: event.locals.user.username,
			gamecreations,
			baseurl: env.BASE_URL
		}
	}

	return {
		files,
		baseurl: env.BASE_URL
	}
}
