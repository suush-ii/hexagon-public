import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url }) => {
	return json([])
}
