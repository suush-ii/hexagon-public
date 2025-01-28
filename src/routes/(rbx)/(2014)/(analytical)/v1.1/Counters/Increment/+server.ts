import { type RequestHandler, text } from '@sveltejs/kit'
export const trailingSlash = 'ignore'

export const fallback: RequestHandler = async () => {
	return text('')
}
