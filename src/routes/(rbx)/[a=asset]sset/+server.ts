import { type RequestHandler, error, redirect, json } from '@sveltejs/kit'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { assetTable, assetCacheTable } from '$lib/server/schema/assets'
import { eq } from 'drizzle-orm'
import { s3Url } from '$src/stores'
import { RCC_ACCESS_KEY } from '$env/static/private'
export const trailingSlash = 'ignore'

const assetSchema = z.number().int().positive()

function getCdnUrl(hash: string) {
	for (var t = 31, n = 0; n < hash.length; n++) t ^= hash[n].charCodeAt(0)
	return 'https://c'.concat((t % 8).toString(), '.rbxcdn.com/').concat(hash)
}

export const GET: RequestHandler = async ({ url, request }) => {
	const result = await assetSchema.safeParseAsync(Number(url.searchParams.get('id')))

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const assetId = result.data

	const existingAsset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, assetId),
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
		redirect(302, `https://${s3Url}/${existingAsset.assetType}/` + existingAsset?.simpleasseturl)
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

		redirect(302, `https://${s3Url}/${existingAsset?.assetType}/` + existingAsset?.place.placeurl)
	}
	// TODO: setup moderation steps for assets

	const cachedAsset = await db
		.select({ filehash: assetCacheTable.filehash })
		.from(assetCacheTable)
		.where(eq(assetCacheTable.assetid, assetId))
		.limit(1)

	if (cachedAsset?.[0]?.filehash) {
		redirect(302, getCdnUrl(cachedAsset[0].filehash))
	} else {
		const response = await fetch('https://assetdelivery.roblox.com/v1/assetId/' + assetId, {
			headers: { 'User-Agent': 'Roblox/WinInet' }
		})
		const data = await response.json()

		if (data) {
			if (data.location) {
				await db.insert(assetCacheTable).values({
					assetid: assetId,
					filehash: data.location.substring(22)
				})
			}
		}
	}

	redirect(302, 'https://assetdelivery.roblox.com/v1/asset/?id=' + assetId)
}
