import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	if (!url.searchParams.get('id')) {
		redirect(302, '/admin/users/find?redirect=moderateuser')
	}
}
