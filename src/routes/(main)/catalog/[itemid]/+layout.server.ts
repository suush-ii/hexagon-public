import type { LayoutServerLoad } from './$types'
import { placesTable } from '$lib/server/schema/games'
import { db } from '$lib/server/db'
import { eq, and } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { assetTable } from '$lib/server/schema/assets'
import { jobsTable } from '$lib/server/schema/games'
import { slugify } from '$lib/utils'
type jobs = typeof jobsTable.$inferSelect

export const load: LayoutServerLoad = async ({ params, locals, depends, cookies, url }) => {
	const result = await z.number().safeParseAsync(Number(params.itemid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const item = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, Number(params.itemid)),
		columns: {
			assetname: true,
			price: true,
			assetid: true,
			assetType: true,
			creatoruserid: true,
			created: true,
			updated: true,
			sales: true,
			description: true
		},
		with: {
			author: {
				columns: {
					username: true
				}
			}
		}
	})

	if (!item) {
		error(404, { success: false, message: 'Item not found.', data: {} })
	}

	const slugGameName = slugify(item.assetname)

	if (params?.item !== slugGameName) {
		redirect(302, '/catalog/' + Number(params.itemid) + '/' + slugGameName)
	}

	return {
		item: item
	}
}
