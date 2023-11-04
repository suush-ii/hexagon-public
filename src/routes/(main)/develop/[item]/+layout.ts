import { z } from 'zod'
import type { LayoutLoad } from './$types'
import { error } from '@sveltejs/kit'

interface assetPrimitive {
	friendlyName: string,
	fileTypes: string[],
	mimeTypes: string[]
}

interface assets {
	[key: string]: assetPrimitive
}

export let _uploadableAssets: assets = {'games':{friendlyName: "Game", fileTypes: [".rbxl"], mimeTypes: ["application/octet-stream"]},
'audio':{friendlyName: "Audio", fileTypes: [".mp3"], mimeTypes: ["audio/mp3"]},
'decals':{friendlyName: "Decal", fileTypes: ['.png','.jpg','.jpeg'], mimeTypes: ["image/png","image/jpeg", "image/jpg"]}}

export const load: LayoutLoad = async ({ params }) => {
	const result = await z.enum(['games', 'audio', 'decals']).safeParseAsync(params.item)

	if (result.success === false) {
		throw error(404, { success: false, message: 'Not found.' })
	}

	return {
		item: params.item,
		friendlyName: _uploadableAssets[params.item].friendlyName,
		fileTypes: _uploadableAssets[params.item].fileTypes
	}
}
