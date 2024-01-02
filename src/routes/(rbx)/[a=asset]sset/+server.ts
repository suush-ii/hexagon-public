import { type RequestHandler, error, redirect, json } from '@sveltejs/kit'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema/assets'
import { eq } from 'drizzle-orm'
import { s3Url } from '$src/stores'
import { RCC_ACCESS_KEY } from '$env/static/private'
export const trailingSlash = 'ignore'

const assetSchema = z.number().int().positive()

export const GET: RequestHandler = async ({ url, request }) => {
	const result = await assetSchema.safeParseAsync(Number(url.searchParams.get('id')))

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} });
	}

	const existingAsset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, Number(url.searchParams.get('id'))),
		columns: {
			assetType: true,
			simpleasseturl: true
		},
		with: {
			place: {
				columns: {
					placeurl: true
				}
			}
		}
	})

	if (existingAsset?.assetType === 'audio' || existingAsset?.assetType === 'decals') {
		redirect(
        			302,
        			`https://${s3Url}/${existingAsset.assetType}/` + existingAsset?.simpleasseturl
		);
	}

	if (existingAsset?.assetType === 'games') {
		// authenticate this
		const accessKey = request.headers.get('accesskey')

		if (!accessKey || RCC_ACCESS_KEY != accessKey) {
			return json({
				success: false,
				message: "You don't have permission to access this asset.",
				data: {}
			})
		}

		redirect(
        			302,
        			`https://${s3Url}/${existingAsset?.assetType}/` + existingAsset?.place.placeurl
		);
	}
	// TODO: setup authentication for games
	// TODO: setup moderation steps for assets

	redirect(
    		302,
    		'https://assetdelivery.roblox.com/v1/asset/?id=' + Number(url.searchParams.get('id'))
    	);
}
