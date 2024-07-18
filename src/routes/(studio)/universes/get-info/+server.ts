import { error, json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'

export const GET: RequestHandler = async ({ url }) => {
	const result = await z.coerce
		.number()
		.int()
		.min(0)
		.safeParseAsync(url.searchParams.get('placeId') ?? '0')

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		return error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	return json({ StudioAccessToApisAllowed: true })
}
