import { db } from '$lib/server/db'
import type { PageServerLoad } from './$types'
import { assetTable, gamesTable, placesTable } from '$lib/server/schema'
import { desc, eq } from 'drizzle-orm'
import { env } from '$env/dynamic/private'
import { imageSql } from '$lib/server/games/getImage'
export const csr = false

export const load: PageServerLoad = async (event) => {
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
			.limit(50)
			.orderBy(desc(gamesTable.updated))

		return {
			gamecreations,
			baseurl: env.BASE_URL
		}
	}

	return {
		baseurl: env.BASE_URL
	}
}
