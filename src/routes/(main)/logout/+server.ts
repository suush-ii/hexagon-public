import { auth } from '$lib/server/lucia'
import { redirect } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) redirect(302, '/login')
	await auth.invalidateSession(session.sessionId) // invalidate session
	locals.auth.setSession(null) // remove cookie
	redirect(302, '/login') // redirect to login page
}
