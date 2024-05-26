import { error, json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { gamesTable, recentlyPlayedTable, placesTable } from '$lib/server/schema'
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
		with: { associatedgame: { columns: { visits: true, universeid: true } } }
	})

	if (!place) {
		return error(404, {
			success: false,
			message: 'Place not found',
			data: {}
		})
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
