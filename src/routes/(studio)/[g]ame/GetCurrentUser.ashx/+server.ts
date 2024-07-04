import { auth } from '$lib/server/lucia'
import { text, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async (event) => {
	event.locals.auth = auth.handleRequest(event)

	const session = await event.locals.auth.validate()

	if (session?.user?.userid) {
		return text('1')
	}
	return text('0') // 1: logged in 0: logged out
}
