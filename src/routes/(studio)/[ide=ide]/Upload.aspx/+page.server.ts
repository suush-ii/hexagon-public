import type { PageServerLoad } from './$types'
export const csr = false

import page from './upload.html?raw'

export const load: PageServerLoad = async ({}) => {
	return {
		page
	}
}
