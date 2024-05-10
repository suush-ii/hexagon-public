import type { PageServerLoad } from './$types'
import { _assetSchema } from './+layout.server'
import { db } from '$lib/server/db'
import { gamesTable } from '$lib/server/schema/games'
import { assetTable } from '$lib/server/schema/assets'
import { eq, and, desc } from 'drizzle-orm'
import { error } from '@sveltejs/kit'
import { s3Url } from '$src/stores'
import pending from '$lib/icons/iconpending.png'
import rejected from '$lib/icons/iconrejected.png'
import audio from '$lib/icons/audio.png'

export const load: PageServerLoad = async ({ params, parent }) => {
	const result = await _assetSchema.safeParseAsync(params.item)
	const session = await (await parent()).user

	if (result.success === false) {
		error(404, { success: false, message: 'Not found.' })
	}

	let creations: {
		assetName: string
		assetid: number
		assetType: string
		updated: Date
		iconUrl: string | null
		totalStat: number
		last7DaysStat: number
	}[] = []

	if (params.item === 'games') {
		const gamecreations = await db
			.select()
			.from(gamesTable)
			.where(eq(gamesTable.creatoruserid, session.userid))
			.limit(20)

		creations = gamecreations.map((game) => ({
			assetName: game.gamename,
			assetid: game.universeid,
			iconUrl: game.iconurl,
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
		// default asset
		const assetcreations = await db.query.assetTable.findMany({
			limit: 20,
			where: and(
				eq(assetTable.creatoruserid, session.userid),
				eq(assetTable.assetType, params.item)
			),
			with: {
				associatedImage: {
					columns: {
						simpleasseturl: true
					}
				}
			},
			orderBy: desc(assetTable.created)
		}) // TODO: Pagination here

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

	return { creations, params: params.item }
}
