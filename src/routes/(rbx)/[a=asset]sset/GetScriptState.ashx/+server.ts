import { type RequestHandler, text } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return text('0 0 0 0')
}
