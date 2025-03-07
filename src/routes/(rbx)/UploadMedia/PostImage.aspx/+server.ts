import { type RequestHandler, error, text } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return text("lol test")
}
