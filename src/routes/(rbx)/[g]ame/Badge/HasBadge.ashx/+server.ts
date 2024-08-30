import { text, type RequestHandler } from '@sveltejs/kit'

export const fallback: RequestHandler = async (event) => {
	return text('0')
}
