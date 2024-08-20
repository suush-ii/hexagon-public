import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	return {
		badge: url.searchParams.get('badge')
	}
}
