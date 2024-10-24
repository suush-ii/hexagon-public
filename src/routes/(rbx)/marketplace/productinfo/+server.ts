import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema'
import type { AssetTypes } from '$src/lib/types'
import { type RequestHandler, error, json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const GET: RequestHandler = async ({ url }) => {
	const result = await z.coerce
		.number()
		.int()
		.positive()
		.safeParseAsync(url.searchParams.get('assetId'))

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const assetId = result.data

	const asset = await db.query.assetTable.findFirst({
		columns: {
			assetname: true,
			description: true,
			created: true,
			updated: true,
			price: true,
			assetType: true,
			onsale: true
		},
		with: {
			author: {
				columns: {
					userid: true,
					username: true
				}
			},
			place: {
				columns: {
					placename: true
				}
			}
		},
		where: eq(assetTable.assetid, assetId)
	})

	if (!asset) {
		error(404, { success: false, message: 'Asset not found.', data: {} })
	}

	return json({
		Name: asset?.place?.placename ?? asset.assetname,
		Description: asset.description,
		Created: asset.created,
		Updated: asset.updated,
		PriceInRobux: asset.price,
		PriceInTickets: 0,
		AssetId: assetId,
		ProductId: assetId,
		AssetTypeId: enumFromAssetType(asset.assetType),
		Creator: {
			Id: asset.author.userid,
			Name: asset.author.username,
			CreatorType: 'User'
		},
		MinimumMembershipLevel: 0,
		IsForSale: asset.onsale
	})
}

function enumFromAssetType(value: AssetTypes): number {
	switch (value) {
		case 'images':
			return 1
		case 't-shirts':
			return 2
		case 'audio':
			return 3
		case 'games':
			return 9
		case 'gamepasses':
			return 34
	}
	return 0
}
