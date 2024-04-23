import { type Handle, error } from '@sveltejs/kit'
import { RCC_ACCESS_KEY } from '$env/static/private'

export const rccAuth = (async ({ event, resolve }) => {
	const pathname = event.url.pathname
	if (
		pathname.startsWith('/updatejob') ||
		pathname === '/GetAllowedMD5Hashes' ||
		pathname === '/GetAllowedSecurityVersions' /*||
		pathname === '/game/gameserver.ashx'*/
	) {
		const accessKey =
			event.url.searchParams.get('accessKey') || event.request.headers.get('accessKey')

		if (!accessKey || RCC_ACCESS_KEY != accessKey) {
			return error(403, {
				success: false,
				message: 'Invalid session.',
				data: {}
			})
		}
	}

	const response = await resolve(event)
	return response
}) satisfies Handle
