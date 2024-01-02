import type { PageServerLoad } from './$types'
import { _assetSchema } from './+layout'
import { db } from '$lib/server/db'
import { gamesTable } from '$lib/server/schema/games'
import { assetTable } from '$lib/server/schema/assets'
import { eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ params, parent }) => {
	const result = await _assetSchema.safeParseAsync(params.item)
	const session = await (await parent()).session

	if (result.success === false) {
		error(404, { success: false, message: 'Not found.' });
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

	if (params.item === 'audio' || params.item === 'decals') {
		// default asset
		const assetcreations = await db
			.select()
			.from(assetTable)
			.where(eq(assetTable.creatoruserid, session.userid))
			.where(eq(assetTable.assetType, params.item))
			.limit(20)

		creations = assetcreations.map((asset) => ({
			assetName: asset.assetname,
			assetid: asset.assetid,
			iconUrl: null, //TODO: make an audio/decal default icon
			updated: asset.created,
			assetType: params.item,
			totalStat: asset.sales,
			last7DaysStat: 0
		}))
	}

	return { creations }
}
