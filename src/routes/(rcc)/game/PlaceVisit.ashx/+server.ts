import { error, json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { gamesTable, recentlyPlayedTable, placesTable, assetTable } from '$lib/server/schema'
import { and, eq } from 'drizzle-orm'

import { z } from 'zod'

const visitSchema = z.object({
	placeid: z.coerce.number().int().positive(),
	userid: z.coerce.number().int().positive()
})

export const POST: RequestHandler = async ({ url }) => {
	const result = await visitSchema.safeParseAsync({
		placeid: url.searchParams.get('AssociatedPlaceID'),
		userid: url.searchParams.get('UserID')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { placeid, userid } = result.data

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, placeid),
		columns: {},
		with: {
			associatedgame: { columns: { visits: true, universeid: true } },
			associatedasset: { columns: { last7dayscounter: true, lastweekreset: true } }
		}
	})

	if (!place) {
		return error(404, {
			success: false,
			message: 'Place not found',
			data: {}
		})
	}

	if (
		new Date().valueOf() - place.associatedasset.lastweekreset.valueOf() >
		7 * 24 * 60 * 60 * 1000 // 7 days
	) {
		await db.update(assetTable).set({ last7dayscounter: 0 }).where(eq(assetTable.assetid, placeid))

		await db
			.update(assetTable)
			.set({ lastweekreset: new Date() })
			.where(eq(assetTable.assetid, placeid))
	} else {
		await db
			.update(assetTable)
			.set({ last7dayscounter: Number(place.associatedasset.last7dayscounter) + 1 })
			.where(eq(assetTable.assetid, placeid))
	}

	await db
		.update(gamesTable)
		.set({ visits: Number(place?.associatedgame.visits) + 1 })
		.where(eq(gamesTable.universeid, Number(place?.associatedgame.universeid)))

	await db
		.delete(recentlyPlayedTable)
		.where(
			and(
				eq(recentlyPlayedTable.gameid, Number(place?.associatedgame.universeid)),
				eq(recentlyPlayedTable.userid, userid)
			)
		) // dont want duplicate games in the homepage

	await db
		.insert(recentlyPlayedTable)
		.values({ gameid: Number(place?.associatedgame.universeid), userid: userid })

	return json({
		success: true,
		message: '',
		data: {}
	})
}
