import { z } from 'zod'
import type { LayoutLoad } from './$types'
import { error } from '@sveltejs/kit'
export const _assetSchema = z.enum(['games', 'audio', 'decals', 'shirts', 'pants'])

interface assetPrimitive {
	friendlyName: string
	fileTypes: string[]
	mimeTypes: string[]
}

const imagePrimitive = {
	fileTypes: ['.png', '.jpg', '.jpeg'],
	mimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
}

export let _uploadableAssets: Record<string, assetPrimitive> = {
	games: { friendlyName: 'Game', fileTypes: ['.rbxl'], mimeTypes: ['application/octet-stream'] },
	audio: { friendlyName: 'Audio', fileTypes: ['.mp3'], mimeTypes: ['audio/mpeg'] },
	decals: {
		friendlyName: 'Decal',
		...imagePrimitive
	},
	shirts: {
		friendlyName: 'Shirt',
		...imagePrimitive
	},
	pants: {
		friendlyName: 'Pants',
		...imagePrimitive
	}
}

export const load: LayoutLoad = async ({ params }) => {
	const result = await _assetSchema.safeParseAsync(params.item)

	if (result.success === false) {
		throw error(404, { success: false, message: 'Not found.' })
	}

	return {
		item: params.item,
		friendlyName: _uploadableAssets[params.item].friendlyName,
		fileTypes: _uploadableAssets[params.item].fileTypes
	}
}
