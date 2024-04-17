import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return json({ data: ['8f37bf59b0f699b25811803baa703ae3'] })
}
