import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './/$types'
import { relationsTable } from '$lib/server/schema'
import { and, count, eq } from 'drizzle-orm'
import { db } from '$lib/server/db'
const protectedroutes = ['/home', '/catalog', '/develop', '/games']

export const load: LayoutServerLoad = (async ({ url, locals, request, cookies }) => {
	const user = locals.user
	const acceptedLanguage = request.headers
		.get('accept-language')
		?.split(',')[0]
		.trim()
		.toLowerCase()
		.replace('-', '_')
	const chosenLocale = cookies.get('locale')

	if (
		protectedroutes.includes(url.pathname) === true ||
		protectedroutes.some((substr) =>
			url.pathname.toLowerCase().startsWith(substr.toLowerCase())
		) === true
	) {
		if (!user) {
			redirect(302, '/auth/login')
		}
	}

	const config = locals.config

	let requestCount = 0

	if (user) {
		const [counter] = await db
			.select({ count: count() })
			.from(relationsTable)
			.where(
				and(eq(relationsTable.recipient, locals.user.userid), eq(relationsTable.type, 'request'))
			)
			.limit(1)

		requestCount = counter.count
	}

	return {
		user,
		requestCount,
		sitealert: config[0].sitealert,
		acceptedLanguage,
		chosenLocale
	}
}) satisfies LayoutServerLoad
