import { type Handle, error } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import * as jose from 'jose'

export const rccAuth = (async ({ event, resolve }) => {
	const pathname = event.url.pathname.toLowerCase()

	if (
		pathname.startsWith('/updatejob') ||
		pathname === '/getallowedmd5hashes' ||
		pathname === '/getallowedsecurityversions' ||
		pathname === '/game/placevisit.ashx' ||
		pathname === '/game/placespecificscript.ashx' ||
		pathname === '/persistence/getbloburl.ashx' ||
		pathname === '/persistence/setblob.ashx' ||
		pathname === '/verify-player' ||
		pathname === '/verify-player/ip' ||
		pathname === '/game/knockouts.ashx' ||
		pathname === '/game/wipeouts.ashx' ||
		pathname === '/game/badge/awardbadge.ashx' ||
		pathname === '/game/newpresence.ashx' ||
		pathname === '/game/log.ashx' ||
		pathname === '/abusereport/client.ashx'
	) {
		const accessKey =
			event.url.searchParams.get('apikey') ||
			event.request.headers.get('accessKey') ||
			event.request.headers.get('accesskey')

		try {
			await jose.jwtVerify(accessKey ?? '', new TextEncoder().encode(env.RCC_ACCESS_KEY as string))
		} catch {
			if (!accessKey || (env.RCC_ACCESS_KEY as string) != accessKey) {
				return error(403, {
					success: false,
					message: 'Invalid session.',
					data: {}
				})
			}
		}
	}

	const response = await resolve(event)
	return response
}) satisfies Handle
