import { type RequestHandler, error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema/assets'
import { eq } from 'drizzle-orm'
import { s3Url } from '$src/stores'

const assetSchema = z.number().int().positive()

export const GET: RequestHandler = async ({ url }) => {
	const result = await assetSchema.safeParseAsync(Number(url.searchParams.get('id')))

	if (!result.success) {
		throw error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const existingAsset = await db
		.select({ assetUrl: assetTable.simpleasseturl, assetType: assetTable.assetType })
		.from(assetTable)
		.where(eq(assetTable.assetid, Number(url.searchParams.get('id'))))
		.limit(1)

	if (existingAsset?.[0].assetType === 'audio' || existingAsset?.[0].assetType === 'decals') {
		throw redirect(
			302,
			`https://${s3Url}/${existingAsset?.[0].assetType}/` + existingAsset?.[0].assetUrl
		)
	}
	// TODO: setup authentication for games
	// TODO: setup moderation steps for assets

	throw redirect(
		302,
		'https://assetdelivery.roblox.com/v1/asset/?id=' + Number(url.searchParams.get('id'))
	)
}
