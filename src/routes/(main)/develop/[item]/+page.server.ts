import type { PageServerLoad } from './$types'
import { _assetSchema } from './+layout'
import { db } from '$lib/server/db'
import { gamesTable } from '$lib/server/schema/games'
import { assetTable } from '$lib/server/schema/assets'
import { eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

function formatDate(date: Date): string {
	const day = date.getDate()
	const month = date.getMonth() + 1 // Months are 0-based in JavaScript
	const year = date.getFullYear()

	return `${day}/${month}/${year}`
}

export const load: PageServerLoad = async ({ params, parent }) => {
	const result = await _assetSchema.safeParseAsync(params.item)
	const session = await (await parent()).session

	if (result.success === false) {
		throw error(404, { success: false, message: 'Not found.' })
	}

	let creations: {
		assetName: string
		assetid: number
		updated: string
		iconUrl: string | null
	}[] = []

	if (params.item === 'games') {
		const gamecreations = await db
			.select()
			.from(gamesTable)
			.where(eq(gamesTable.creatoruserid, session.userid))
			.limit(20)

		creations = gamecreations.map((game) => ({
			assetName: game.gamename,
			assetid: game.gameid,
			iconUrl: game.iconurl,
			updated: formatDate(game.updated)
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
			updated: formatDate(asset.created)
		}))
	}

	return { creations }
}
