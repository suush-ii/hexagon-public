import { error, text, type RequestHandler } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import script from './visit.lua?raw'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { placesTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { auth } from '$src/lib/server/lucia'
import { signScript } from '$src/lib/server/signScript'

const UploadUrl = `http://${env.BASE_URL}/Data/Upload.ashx`

const visitSchema = z.object({
	userId: z.coerce.number().int(),
	placeId: z.coerce.number().int(),
	build: z.coerce.boolean()
})

const scriptNew: string = script.replaceAll('roblox.com', env.BASE_URL as string)

export const GET: RequestHandler = async (event) => {
	const { url, locals } = event

	const result = await visitSchema.safeParseAsync({
		userId: url.searchParams.get('UserID') ?? '0',
		placeId: url.searchParams.get('PlaceID') ?? '1',
		build: url.searchParams.get('Build') ?? false
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		return error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	if (result.data.userId < 1) {
		result.data.userId = 0
	}

	const placeId = result.data.placeId
	const userId = result.data.userId

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
	scriptNewArgs = scriptNewArgs.replaceAll('{UserID}', userId.toString())
	scriptNewArgs = scriptNewArgs.replaceAll('{Build}', result.data.build ? 'true' : 'false')
	scriptNewArgs = scriptNewArgs.replaceAll(
		'{addedBuildTools}',
		result.data.build ? 'false' : 'true'
	)

	locals.auth = auth.handleRequest(event)

	const session = await locals.auth.validate()

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
