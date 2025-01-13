import { error, text, type RequestHandler } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import script from './visit.lua?raw'
import { createSign } from 'node:crypto'
import { z } from 'zod'

const visitSchema = z.object({
	userId: z.coerce.number().int(),
	placeId: z.coerce.number().int()
})

const scriptNew: string = script.replaceAll('roblox.com', env.BASE_URL as string)

export const GET: RequestHandler = async ({ url }) => {
	const result = await visitSchema.safeParseAsync({
		userId: url.searchParams.get('UserID') ?? '0',
		placeId: url.searchParams.get('PlaceID') ?? '1'
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

	let scriptNewArgs = scriptNew

	scriptNewArgs = scriptNewArgs.replaceAll('{PlaceId}', placeId.toString())
	scriptNewArgs = scriptNewArgs.replaceAll('{UserID}', userId.toString())

	const sign = createSign('SHA1')
	sign.update('\r\n' + scriptNewArgs)
	const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

	return text('--rbxsig%' + signature + '%\r\n' + scriptNewArgs)
}
