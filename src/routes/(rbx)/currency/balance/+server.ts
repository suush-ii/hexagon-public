import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals }) => {
	return json({
		success: true,
		robux: locals.user.coins,
		tickets: 0
	})
}
