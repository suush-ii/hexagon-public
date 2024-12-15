import { auth } from '$lib/server/lucia'
import { type RequestHandler, text } from '@sveltejs/kit'
import { LuciaError } from 'lucia'

export const POST: RequestHandler = async ({ locals, cookies }) => {
	const authBearer = cookies.get('.ROBLOSECURITY') ?? ''

	cookies.delete('.ROBLOSECURITY', {
		path: '/'
	})

	let session

	try {
		const sessionVal = await auth.validateSession(authBearer)

		if (sessionVal) {
			session = sessionVal
		} else {
			return text('')
		}
	} catch (e) {
		if (e instanceof LuciaError && e.message === `AUTH_INVALID_SESSION_ID`) {
			// invalid session
			return text('')
		}
	}

	await auth.invalidateSession(session.sessionId) // invalidate session
	return text('')
}
