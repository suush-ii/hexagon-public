import { type RequestHandler, text } from '@sveltejs/kit'
export const trailingSlash = 'ignore'

export const POST: RequestHandler = async () => {
	return text('')
}
