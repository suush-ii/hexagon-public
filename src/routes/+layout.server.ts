import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './/$types'
const protectedroutes = ['/home', '/catalog', '/develop', '/games']

export const load: LayoutServerLoad = (async ({ url, locals }) => {
	const user = locals.user

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

	if (config?.[0]?.maintenanceEnabled === true) {
		if (url.pathname != '/maintenance') {
			redirect(302, '/maintenance')
		}
	}

	return {
		user
	}
}) satisfies LayoutServerLoad
