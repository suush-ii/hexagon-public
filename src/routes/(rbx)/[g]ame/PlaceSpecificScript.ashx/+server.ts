import { error, text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { BASE_URL, CLIENT_PRIVATE_KEY } from '$env/static/private'
import { createSign } from 'node:crypto'
import script from './placespecificscript.lua?raw'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { placesTable } from '$lib/server/schema'

const placeInfoSchema = z.object({
	placeid: z.coerce.number().int().positive()
})

const scriptNew: string = script.replaceAll('www.roblox.com', BASE_URL)
export const fallback: RequestHandler = async ({ url }) => {
	const result = await placeInfoSchema.safeParseAsync({
		placeid: url.searchParams.get('PlaceId')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	let scriptNewArgs = scriptNew

	const { placeid } = result.data

	const place = await db.query.placesTable.findFirst({
		columns: {},
		where: eq(placesTable.placeid, placeid),
		with: {
			associatedgame: {
				columns: {
					creatoruserid: true
				}
			}
		}
	})

	if (!place) {
		return error(404, { success: false, message: 'Place not found', data: {} })
	}

	scriptNewArgs = scriptNewArgs.replaceAll('{placeId}', placeid.toString())

	const sign = createSign('SHA1')
	sign.update('\r\n' + scriptNewArgs)
	const signature = sign.sign(CLIENT_PRIVATE_KEY, 'base64')

	return text('--rbxsig%' + signature + '%\r\n' + scriptNewArgs)
}
