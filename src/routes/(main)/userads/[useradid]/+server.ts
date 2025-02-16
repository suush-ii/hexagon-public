import { db } from '$src/lib/server/db'
import { assetTable, placesTable, userAdsTable } from '$src/lib/server/schema'
import { error, json, redirect, type RequestHandler } from '@sveltejs/kit'
import { count, eq, desc, sum, sql } from 'drizzle-orm'
import { z } from 'zod'
import { s3Url } from '$src/stores'

const adSchema = z.object({
	useradid: z.coerce.number().int()
})

export const GET: RequestHandler = async ({ url, params }) => {
	const result = await adSchema.safeParseAsync({
		useradid: params.useradid
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { useradid } = result.data

	const ad = await db.query.userAdsTable.findFirst({
		where: eq(userAdsTable.useradid, useradid),
		columns: {
			assocatedassetid: true,
			associatedassetype: true,
			bidexpires: true
		},
		with: {
			associatedGame: {
				columns: {},
				with: {
					places: {
						columns: {
							placeid: true
						},
						where: eq(placesTable.startplace, true),
						limit: 1
					}
				}
			}
		}
	})

	if (!ad) {
		return error(404, { success: false, message: 'Ad not found!' })
	}

	if (ad.bidexpires < new Date()) {
		return error(404, { success: false, message: 'Ad expired!' })
	}

	await db
		.update(userAdsTable)
		.set({
			clickscurrent: sql`${userAdsTable.clickscurrent} + 1`,
			clickstotal: sql`${userAdsTable.clickstotal} + 1`
		})
		.where(eq(userAdsTable.useradid, useradid))
		.execute()

	return redirect(
		302,
		`/${ad.associatedassetype === 'games' ? 'games' : 'catalog'}/${ad.associatedassetype === 'games' ? ad.associatedGame.places[0].placeid : ad.assocatedassetid}`
	)
}
