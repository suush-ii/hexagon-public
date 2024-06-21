import { type Handle } from '@sveltejs/kit'
import { themes } from '$lib/themes'

export const themesHandle = (async ({ event, resolve }) => {
	const theme = event.cookies.get('theme')

	if (!theme || !themes.includes(theme)) {
		return await resolve(event)
	}

	return await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('class="dark"', `class="${theme}"`)
		}
	})
}) satisfies Handle
