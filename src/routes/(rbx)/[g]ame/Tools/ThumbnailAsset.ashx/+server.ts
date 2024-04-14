import { type RequestHandler, redirect, error } from '@sveltejs/kit'
import { z } from 'zod'
const assetSchema = z.number().int().positive()

export const GET: RequestHandler = async ({ url }) => {
	const result = await assetSchema.safeParseAsync(Number(url.searchParams.get('aid')))

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const assetId = result.data

	const res = await fetch(
		'https://thumbnails.roblox.com/v1/assets?assetids=' +
			assetId +
			'&size=700x700&format=Png&isCircular=false'
	)
	const json = await res.json()
	if (json?.data?.[0]?.imageUrl) {
		redirect(302, json.data[0].imageUrl)
	}

	error(400, { success: false, message: 'Malformed ID.', data: {} })
}
