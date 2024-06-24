import { redirect } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	redirect(302, `/users/${params.userId}/profile`)
}
