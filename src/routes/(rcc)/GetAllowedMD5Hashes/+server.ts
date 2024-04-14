import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return json({ data: ['8697553b9a3a0d9c25d7b76a4426e067'] })
}
