import { error, json, text, type Handle } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

/**
 * CSRF protection copied from sveltekit but with the ability to turn it off for specific routes.
 * credits https://github.com/sveltejs/kit/issues/6784#issuecomment-1416104897
 */
const csrf =
	(allowedPaths: string[]): Handle =>
	async ({ event, resolve }) => {
		if ((env.CSRF as string) !== 'false') {
			const forbidden =
				event.request.method === 'POST' &&
				event.request.headers.get('origin') !== event.url.origin &&
				isFormContentType(event.request) &&
				!allowedPaths.includes(event.url.pathname)

			if (forbidden) {
				const csrfError = error(
					403,
					// @ts-ignore
					// since we are only replacing the sveltekit csrf we want to replicate it exactly which means not respecting the standard error message here
					// we only want to add whitelisted paths because of the dumnb roblox client
					`Cross-site ${event.request.method} form submissions are forbidden`
				)
				if (event.request.headers.get('accept') === 'application/json') {
					// @ts-ignore
					return json(csrfError.body, { status: csrfError.status })
				}
				// @ts-ignore
				return text(csrfError.body.message, { status: csrfError.status })
			}
		}
		return resolve(event)
	}
function isContentType(request: Request, ...types: string[]) {
	const type = request.headers.get('content-type')?.split(';', 1)[0].trim() ?? ''
	return types.includes(type)
}
function isFormContentType(request: Request) {
	return isContentType(request, 'application/x-www-form-urlencoded', 'multipart/form-data')
}

export const csrfHandle = csrf([
	'/game/validate-machine',
	'/Game/validate-machine',
	'/persistence/set'
])
