import { _uploadableAssets } from '$src/routes/(main)/develop/[item]/+layout.server'
import { error } from '@sveltejs/kit'
import { adminAssets } from '.'
export const _assetSchema = z.enum(adminAssets)

import type { LayoutServerLoad } from './$types'
import { z } from 'zod'

export const load: LayoutServerLoad = async ({ params }) => {
	const result = await _assetSchema.safeParseAsync(params.item)

	if (result.success === false) {
		error(404, { success: false, message: 'Not found.' })
	}

	return {
		item: params.item,
		friendlyName: _uploadableAssets[params.item].friendlyName,
		fileTypes: _uploadableAssets[params.item].fileTypes
	}
}
