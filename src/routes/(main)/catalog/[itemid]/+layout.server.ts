import type { LayoutServerLoad } from './$types'
import { placesTable } from '$lib/server/schema/games'
import { db } from '$lib/server/db'
import { eq, and } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { votesTable } from '$lib/server/schema/gamevotes'
import { jobsTable } from '$lib/server/schema/games'
import { slugify } from '$lib/utils'
type jobs = typeof jobsTable.$inferSelect

export const load: LayoutServerLoad = async ({ params, locals, depends, cookies, url }) => {
	const result = await z.number().safeParseAsync(Number(params.itemid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}
	/*

	if (!item) {
		error(404, { success: false, message: 'Game not found.', data: {} })
	}

	const slugGameName = slugify(place.associatedgame.gamename)

	if (params?.item !== slugGameName) {
		redirect(302, '/catalog/' + Number(params.itemid) + '/' + slugGameName)
	}

	return {
		place: place
	}*/
}
