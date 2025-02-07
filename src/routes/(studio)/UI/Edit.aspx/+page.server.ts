import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import { ideAssetSchema } from './schema'
import { db } from '$src/lib/server/db'
import { eq } from 'drizzle-orm'
import { assetTable } from '$src/lib/server/schema'
import { env } from '$env/dynamic/private'
export const csr = false

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return error(401, { success: false, message: 'No session.', data: {} })
	}

	const result = await ideAssetSchema.safeParseAsync({
		assetid: url.searchParams.get('assetId')
	})

	if (!result.success) {
		return error(400, { success: false, message: 'invalid form', data: {} })
	}

	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, result.data.assetid),
		columns: {
			assetname: true,
			creatoruserid: true,
			assetid: true
		}
	})

	if (!asset) {
		return error(404, { success: false, message: 'Asset not found.', data: {} })
	}

	if (asset.creatoruserid != locals.user.userid) {
		return error(403, { success: false, message: 'You do not own this asset.', data: {} })
	}

	return {
		baseurl: env.BASE_URL,
		asset
	}
}
