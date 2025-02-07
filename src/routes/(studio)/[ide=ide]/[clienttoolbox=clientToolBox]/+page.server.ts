import { env } from '$env/dynamic/private'
import { z } from 'zod'
import type { PageServerLoad } from './$types'
export const csr = false

export const load: PageServerLoad = async ({ url, locals }) => {
	const result = await z.coerce.number().positive().safeParseAsync(url.searchParams.get('page'))

	const session = locals

	if (session?.user) {
		return {
			baseurl: env.BASE_URL,
			userid: locals.user.userid
		}
	}

	return {
		baseurl: env.BASE_URL
	}
}
