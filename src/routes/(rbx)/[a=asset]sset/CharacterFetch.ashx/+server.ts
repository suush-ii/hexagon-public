import { error, text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { env } from '$env/dynamic/private'
import { assetTable, inventoryTable, placesTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { and, eq, or } from 'drizzle-orm'

const bodyColorsUrl = `http://${env.BASE_URL}/Asset/BodyColors.ashx`

const assetUrl = `http://${env.BASE_URL}/Asset/`

const userSchema = z.object({
	userId: z.coerce.number().int().positive(),
	placeId: z.coerce.number().int().optional()
})

export const GET: RequestHandler = async ({ url, request }) => {
	const result = await userSchema.safeParseAsync({
		userId: url.searchParams.get('userId') ?? url.searchParams.get('userid'),
		placeId: url.searchParams.get('placeId') ?? url.searchParams.get('placeid')
	})

	if (result.success === false) {
		return error(400, { success: false, message: 'Malformed.', data: {} })
	}

	const user = result.data.userId
	const placeId = result.data.placeId

	let inventoryWearing = await db
		.selectDistinctOn([inventoryTable.itemid], {
			itemid: inventoryTable.itemid,
			itemtype: inventoryTable.itemtype,
			gearattributes: assetTable.gearattributes,
			genres: assetTable.genres
		})
		.from(inventoryTable)
		.where(
			and(
				eq(inventoryTable.userid, user),
				or(
					eq(inventoryTable.wearing, true),
					request.headers.get('requester') === 'Server' || !placeId
						? undefined
						: eq(inventoryTable.itemtype, 'gears')
				) // wear all gear
			)
		)
		.leftJoin(assetTable, eq(inventoryTable.itemid, assetTable.assetid))

	if (placeId) {
		const place = await db.query.placesTable.findFirst({
			where: eq(placesTable.placeid, placeId),
			columns: {
				allowedgear: true,
				geargenreenforced: true
			},
			with: {
				associatedgame: {
					columns: {
						genre: true
					}
				}
			}
		})

		if (place) {
			inventoryWearing = inventoryWearing.filter((item) => {
				if (item.itemtype === 'gears') {
					const isAllowed = item.gearattributes?.every((gear) => place?.allowedgear?.includes(gear))

					if (!isAllowed) {
						return false
					}

					if (place?.geargenreenforced === true && place.associatedgame.genre !== 'All') {
						const isAllowed = item.genres?.every((genre) =>
							place.associatedgame.genre.includes(genre)
						)

						if (!isAllowed) {
							return false
						}
					}
				}

				return true
			})
		}
	}

	const assets = inventoryWearing.map((item) => `${assetUrl}?id=${item.itemid}`).join(';')

	return text(`${bodyColorsUrl}?userId=${user};${assets}`)
}
