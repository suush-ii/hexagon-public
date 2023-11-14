import type { LayoutServerLoad } from './$types'
import { gamesTable } from '$lib/server/schema/games'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'

export const load: LayoutServerLoad = async ({ params }) => {
	const result = await z.number().safeParseAsync(Number(params.gameid))

	if (result.success === false) {
		throw error(400, { success: false, message: 'Malformed input.' })
	}

	const game = await db
		.select({
			gamename: gamesTable.gamename,
			active: gamesTable.active,
			visits: gamesTable.visits,
			serversize: gamesTable.serversize,
			updated: gamesTable.updated,
			creatoruserid: gamesTable.creatoruserid,
			description: gamesTable.description,
			thumbnailurl: gamesTable.thumbnailurl
		})
		.from(gamesTable)
		.where(eq(gamesTable.gameid, Number(params.gameid)))
		.limit(1)

	if (!game[0]) {
		throw error(404, { success: false, message: 'Game not found.', data: {} })
	}

	if (params?.game !== game[0].gamename) {
		throw redirect(302, '/games/' + Number(params.gameid) + '/' + game[0].gamename)
	}

	return { game: game[0] }
}
