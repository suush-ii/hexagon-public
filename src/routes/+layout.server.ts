import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { configTable } from '$src/lib/server/schema/config'
import { db } from '$lib/server/db'
const protectedroutes = ['/home', '/catalog', '/develop', '/games']

export const load: LayoutServerLoad = (async ({ url, locals }) => {
	const session = locals.session

	if (
		protectedroutes.includes(url.pathname) === true ||
		protectedroutes.some((substr) =>
			url.pathname.toLowerCase().startsWith(substr.toLowerCase())
		) === true
	) {
		if (!session) {
			throw redirect(302, '/auth/login')
		}
	}

	const config = await db.select().from(configTable).limit(1)

	if (config?.[0]?.maintenanceEnabled === true) {
		if (url.pathname != '/maintenance') {
			throw redirect(302, '/maintenance')
		}
	}
	return {
		session: session?.user
	}
}) satisfies LayoutServerLoad
