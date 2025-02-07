import { text, type RequestHandler } from '@sveltejs/kit'

export const fallback: RequestHandler = async () => {
	return text('')
}
