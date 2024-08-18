import { error, fail } from '@sveltejs/kit'
import { _assetSchema } from '../../../../+layout.server'
import type { PageServerLoad, Actions } from './$types'
import { zod } from 'sveltekit-superforms/adapters'
import { superValidate } from 'sveltekit-superforms/server'
import { formSchema as placeSchema } from '$src/lib/schemas/edit/editplaceschema'
import { db } from '$lib/server/db'
import { count, desc, eq, sql } from 'drizzle-orm'
import { assetVersionsTable, placesTable } from '$lib/server/schema'
import { getPageNumber } from '$lib/utils'

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const result = await _assetSchema.safeParseAsync(params.item)

	if (result.success === false) {
		error(404, { success: false, message: 'Not found.' })
	}

	let page = getPageNumber(url, 'versionsPage')

	const place = await db.query.placesTable.findFirst({
		columns: {
			allowedgear: true,
			geargenreenforced: true,
			placename: true,
			universeid: true
		},
		where: eq(placesTable.placeid, Number(params.placeid)),
		with: {
			associatedgame: {
				columns: {
					creatoruserid: true
				}
			}
		}
	})

	if (!place || place.universeid !== Number(params.assetid)) {
		return error(404, { success: false, message: 'Not found.' })
	}

	if (place.associatedgame.creatoruserid !== Number(locals.user.userid)) {
		return error(403, { success: false, message: 'You do not have permission to edit this place.' })
	}

	const placeForm = await superValidate(zod(placeSchema))

	if (url.searchParams.get('page') === 'versions') {
		const size = 30

		const [versionsCount] = await db
			.select({ count: count() })
			.from(assetVersionsTable)
			.where(eq(assetVersionsTable.assetid, Number(params.placeid)))
			.limit(1)

		if (versionsCount.count < (page - 1) * size) {
			page = 1
		}

		const versions = await db.query.assetVersionsTable.findMany({
			where: eq(assetVersionsTable.assetid, Number(params.placeid)),
			columns: {
				filehash: true,
				time: true
			},
			orderBy: desc(assetVersionsTable.time),
			limit: size,
			offset: (page - 1) * size,
			extras: {
				rank: sql<string>`rank() over (order by ${assetVersionsTable.time} asc)`.as('rank')
			}
		})

		return {
			placeForm,
			assetname: place.placename,
			geargenreenforced: place.geargenreenforced,
			allowedgear: place.allowedgear ?? [],
			versions,
			versionsCount: versionsCount.count
		}
	}

	return {
		placeForm,
		assetname: place.placename,
		geargenreenforced: place.geargenreenforced,
		allowedgear: place.allowedgear ?? [],
		versions: [],
		versionsCount: 0
	}
}

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(placeSchema))

		const result = await _assetSchema.safeParseAsync(params.item)

		if (result.success === false) {
			return fail(400, {
				form
			})
		}

		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const data = form.data

		await db
			.update(placesTable)
			.set({
				placename: data.name,
				geargenreenforced: data.geargenreenforced,
				allowedgear: data.allowedgear,
				updated: new Date()
			})
			.where(eq(placesTable.placeid, Number(params.placeid)))

		return { form }
	}
}
