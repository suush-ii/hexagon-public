import { type RequestHandler, text } from '@sveltejs/kit'

export const fallback: RequestHandler = async () => {
	return text('')
}
