import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return json({ data: ['0.168.0pcplayer', '0.178.0pcplayer', '0.176.0pcplayer'] })
}
