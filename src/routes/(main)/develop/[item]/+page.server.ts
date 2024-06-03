import type { PageServerLoad } from './$types'
import { _assetSchema } from './+layout.server'
import { db } from '$lib/server/db'
import { gamesTable } from '$lib/server/schema/games'
import { assetTable } from '$lib/server/schema/assets'
import { eq, and, desc, count } from 'drizzle-orm'
import { error } from '@sveltejs/kit'
import { s3Url } from '$src/stores'
import pending from '$lib/icons/iconpending.png'
import rejected from '$lib/icons/iconrejected.png'
import audio from '$lib/icons/audio.png'
import { getPageNumber } from '$lib/utils'

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const result = await _assetSchema.safeParseAsync(params.item)

	if (result.success === false) {
		error(404, { success: false, message: 'Not found.' })
	}

	let page = getPageNumber(url)

	let size = 28

	let itemscount

	let creations: {
		assetName: string
		assetid: number
		assetType: string
		updated: Date
		iconUrl?: string | null
		iconId?: number | null
		totalStat: number
		last7DaysStat: number
	}[] = []

	if (params.item === 'games') {
		itemscount = await db
			.select({ count: count() })
			.from(gamesTable)
			.where(eq(gamesTable.creatoruserid, locals.user.userid))
			.limit(1)

		if (itemscount[0].count < (page - 1) * size) {
			page = 1
		}

		const gamecreations = await db
			.select()
			.from(gamesTable)
			.where(eq(gamesTable.creatoruserid, locals.user.userid))
			.limit(size)
			.offset((page - 1) * size)

		creations = gamecreations.map((game) => ({
			assetName: game.gamename,
			assetid: game.universeid,
			iconId: game.iconid,
			updated: game.updated,
			assetType: params.item,
			totalStat: game.visits,
			last7DaysStat: 0
		}))
	}

	if (
		params.item === 'audio' ||
		params.item === 'decals' ||
		params.item === 'shirts' ||
		params.item === 'pants'
	) {
		itemscount = await db
			.select({ count: count() })
			.from(assetTable)
			.where(
				and(eq(assetTable.creatoruserid, locals.user.userid), eq(assetTable.assetType, params.item))
			)
			.limit(1)

		if (itemscount[0].count < (page - 1) * size) {
			page = 1
		}

		// default asset
		const assetcreations = await db.query.assetTable.findMany({
			where: and(
				eq(assetTable.creatoruserid, locals.user.userid),
				eq(assetTable.assetType, params.item)
			),
			with: {
				associatedImage: {
					columns: {
						simpleasseturl: true
					}
				}
			},
			orderBy: desc(assetTable.created),
			limit: size,
			offset: (page - 1) * size
		})

		creations = assetcreations.map((asset) => ({
			assetName: asset.assetname,
			assetid: asset.assetid,
			iconUrl:
				asset.moderationstate === 'pending'
					? pending
					: asset.moderationstate === 'rejected'
						? rejected
						: asset.assetType === 'decals'
							? `https://${s3Url}/images/` + asset?.associatedImage?.simpleasseturl
							: asset.assetType === 'audio'
								? audio
								: null, //TODO: make an audio default icon
			updated: asset.created,
			assetType: params.item,
			totalStat: asset.sales,
			last7DaysStat: 0
		}))
	}

	return { creations, params: params.item, itemcount: itemscount?.[0]?.count ?? 0 }
}
