import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
	if (locals?.config[0]?.maintenanceEnabled === false) {
		redirect(302, '/home')
	}

	return {}
}
