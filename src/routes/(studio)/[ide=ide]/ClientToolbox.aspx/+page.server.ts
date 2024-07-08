import { env } from '$env/dynamic/private'
import type { PageServerLoad } from './$types'
export const csr = false

export const load: PageServerLoad = async () => {
	return {
		baseurl: env.BASE_URL
	}
}
