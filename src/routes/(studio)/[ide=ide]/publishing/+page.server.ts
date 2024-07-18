import type { PageServerLoad } from './$types'
export const csr = false
import { env } from '$env/dynamic/private'
import { z } from 'zod'
import { error } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { placesTable } from '$lib/server/schema'

export const load: PageServerLoad = async ({ url }) => {
	const result = await z.coerce
		.number()
		.int()
		.positive()
		.safeParseAsync(url.searchParams.get('PlaceID') ?? '0')

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const placeId = result.data

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, placeId),
		columns: {},
		with: {
			associatedgame: {
				columns: {
					gamename: true
				}
			}
		}
	})

	if (!place) {
		error(404, { success: false, message: 'Place not found.', data: {} })
	}

	return {
		baseurl: env.BASE_URL,
		placeId,
		placeName: place.associatedgame.gamename
	}
}
