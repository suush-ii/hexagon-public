import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return json({ data: ['0.167.0pcplayer'] })
}
