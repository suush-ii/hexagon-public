import { env } from '$env/dynamic/private'
import type { PageServerLoad } from './$types'
export const csr = false
import { error } from '@sveltejs/kit'
import { ideAssetSchema } from './schema'
import { z } from 'zod'

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return error(401, { success: false, message: 'No session.', data: {} })
	}

	const result = await ideAssetSchema.safeParseAsync({
		Name: url.searchParams.get('Name'),
		Description: url.searchParams.get('Description'),
		Genre: url.searchParams.get('Genre')
	})
	const animation = await z.coerce
		.string()
		.transform((val) => val === 'true')
		.default('false')
		.safeParseAsync(url.searchParams.get('Animation'))

	if (!result.success || !animation.success) {
		return error(400, { success: false, message: 'invalid form', data: {} })
	}

	return {
		baseurl: env.BASE_URL,
		form: result.data,
		animation: animation.data
	}
}
