import { env } from '$env/dynamic/private'
import type { PageServerLoad } from './$types'
export const csr = false
import { error } from '@sveltejs/kit'
import { ideAssetSchema } from './schema'

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return error(401, { success: false, message: 'No session.', data: {} })
	}

	const result = await ideAssetSchema.safeParseAsync({
		Name: url.searchParams.get('Name'),
		Description: url.searchParams.get('Description'),
		Genre: url.searchParams.get('Genre')
	})

	if (!result.success) {
		return error(400, { success: false, message: 'invalid form', data: {} })
	}

	return {
		baseurl: env.BASE_URL,
		form: result.data
	}
}
