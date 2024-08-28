import type { PageServerLoad } from './$types.js'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { assetTable } from '$lib/server/schema/assets'
import { error } from '@sveltejs/kit'
import { imageSql } from '$lib/server/games/getImage'
import { adminAssets } from '../../upload/[item]'

export const load: PageServerLoad = async ({ params }) => {
	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, Number(params.assetid)),
		columns: {
			assetType: true
		}
	})

	if (!asset) {
		return error(404, { success: false, message: 'Asset not found.', data: {} })
	}

	if (!adminAssets.includes(asset.assetType) || asset.assetType === 'packages') {
		return error(403, {
			success: false,
			message: 'You do not have permission to update this asset.',
			data: {}
		})
	}

	return {
		asset
	}
}
