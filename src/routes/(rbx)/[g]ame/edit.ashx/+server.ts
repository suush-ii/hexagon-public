import { error, text, type RequestHandler } from '@sveltejs/kit'
import script from './edit.lua?raw'
import { env } from '$env/dynamic/private'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { placesTable } from '$src/lib/server/schema'
import { eq } from 'drizzle-orm'
import { auth } from '$lib/server/lucia'
import { signScript } from '$src/lib/server/signScript'

const scriptNew: string = script.replaceAll('roblox.com', env.BASE_URL as string)

const UploadUrl = `http://${env.BASE_URL}/Data/Upload.ashx`

export const GET: RequestHandler = async (event) => {
	const result = await z.coerce
		.number()
		.int()
		.positive()
		.safeParseAsync(event.url.searchParams.get('PlaceID') ?? '0')

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
					creatoruserid: true
				}
			}
		}
	})

	let scriptNewArgs = scriptNew

	scriptNewArgs = scriptNewArgs.replaceAll('{PlaceId}', placeId.toString())

	event.locals.auth = auth.handleRequest(event)

	const session = await event.locals.auth.validate()

	if (place?.associatedgame.creatoruserid == session?.user?.userid) {
		// they own the place so let them publish

		scriptNewArgs = scriptNewArgs.replaceAll(
			'{UploadUrl}',
			UploadUrl + '?assetid=' + placeId + '&auth=' + event.cookies.get('.ROBLOSECURITY')
		)
	} else {
		scriptNewArgs = scriptNewArgs.replaceAll('{UploadUrl}', '')
	}

	return text(await signScript(scriptNewArgs, event.request.headers.get('user-agent')))
}
