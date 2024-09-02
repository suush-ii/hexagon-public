import { db } from '$lib/server/db'
import { assetThumbnailCacheTable, placesTable } from '$lib/server/schema'
import { getImage } from '$lib/games/getImage'
import { imageSql } from '$lib/server/games/getImage'
import { type RequestHandler, redirect, error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
const assetSchema = z.number().int().positive()

export const GET: RequestHandler = async ({ url }) => {
	const result = await assetSchema.safeParseAsync(
		Number(url.searchParams.get('AssetID') ?? url.searchParams.get('assetId'))
	)

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const assetId = result.data

	const cachedAsset = await db
		.select({ filehash: assetThumbnailCacheTable.filehash })
		.from(assetThumbnailCacheTable)
		.where(eq(assetThumbnailCacheTable.assetid, assetId))
		.limit(1)

	if (cachedAsset.length > 0) {
		redirect(302, `https://tr.rbxcdn.com/${cachedAsset[0].filehash}/700/700/Model/Png`)
	}

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, assetId),
		columns: {},
		with: {
			associatedgame: {
				columns: {},
				with: {
					thumbnail: {
						columns: {
							moderationstate: true
						},
						extras: {
							simpleasseturl: imageSql
						}
					}
				}
			}
		}
	})

	if (place) {
		return redirect(
			302,
			getImage(
				place.associatedgame.thumbnail?.simpleasseturl,
				place.associatedgame.thumbnail?.moderationstate,
				'thumbnail'
			)
		)
	}

	const res = await fetch(
		'https://thumbnails.roblox.com/v1/assets?assetids=' +
			assetId +
			'&size=700x700&format=Png&isCircular=false'
	)
	const json = await res.json()
	if (json?.data?.[0]?.imageUrl) {
		await db.insert(assetThumbnailCacheTable).values({
			assetid: assetId,
			filehash: json.data[0].imageUrl.split('/')[3]
		})

		redirect(302, json.data[0].imageUrl)
	}

	error(400, { success: false, message: 'Malformed ID.', data: {} })
}
