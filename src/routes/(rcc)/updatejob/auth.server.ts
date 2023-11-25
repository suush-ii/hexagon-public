import { json, type Handle } from '@sveltejs/kit'
import { RCC_ACCESS_KEY } from '$env/static/private'

export const rccAuth = (async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/updatejob')) {
		const accessKey = event.request.headers.get('accesskey')

		if (!accessKey || RCC_ACCESS_KEY != accessKey) {
			return json({
				success: false,
				message: 'Invalid session.',
				data: {}
			})
		}
	}

	const response = await resolve(event)
	return response
}) satisfies Handle
