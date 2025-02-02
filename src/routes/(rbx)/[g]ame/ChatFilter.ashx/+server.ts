import { text, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async ({ url }) => {
	return text('True')
}
