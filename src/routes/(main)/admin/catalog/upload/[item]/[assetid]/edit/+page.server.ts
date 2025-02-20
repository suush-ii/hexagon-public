import { error, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { formSchema as assetSchema } from '$src/lib/schemas/edit/admin/editassetschema'
import { formSchema as gearSchema } from '$src/lib/schemas/edit/admin/editgearschema'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'
import { assetTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { _assetSchema } from '../../+layout.server'
import type { AssetGenreDB } from '$lib/types'

export const load: PageServerLoad = async ({ params, locals }) => {
	const result = await z.number().safeParseAsync(Number(params.assetid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const asset = await db
		.select({
			assetname: assetTable.assetname,
			description: assetTable.description,
			creatoruserid: assetTable.creatoruserid,
			moderationstate: assetTable.moderationstate,
			onsale: assetTable.onsale,
			price: assetTable.price,
			genres: assetTable.genres,
			assettype: assetTable.assetType,
			gearattributes: assetTable.gearattributes,
			limited: assetTable.limited
		})
		.from(assetTable)
		.where(eq(assetTable.assetid, result.data))
		.limit(1)

	if (asset.length === 0 || asset[0].assettype !== params.item) {
		error(404, { success: false, message: 'Asset not found.' })
	}

	if (asset[0].moderationstate === 'rejected') {
		error(403, { success: false, message: 'This asset has been moderated.' })
	}

	const name = asset[0].assetname
	const description = asset[0].description ?? ''
	const onsale = asset[0].onsale
	const price = asset[0].price ?? 0
	const genres = asset[0].genres
	const gearattributes = asset[0].gearattributes ?? []
	const limited = asset[0].limited ? true : false
	const assetForm = await superValidate(zod(assetSchema))
	const gearForm = await superValidate(zod(gearSchema))

	return {
		assetForm,
		gearForm,
		assetid: result.data,
		assetname: name,
		description,
		onsale,
		price,
		genres,
		limited,
		gearattributes
	}
}

async function updateAsset(
	description: string,
	onsale: boolean,
	price: number,
	genres: AssetGenreDB[],
	assetname: string,
	assetid: number,
	limited: boolean = false
) {
	await db
		.update(assetTable)
		.set({
			description,
			onsale,
			price,
			genres,
			assetname,
			updated: new Date(),
			limited: limited ? 'limited' : undefined
		})
		.where(eq(assetTable.assetid, assetid))
}

export const actions: Actions = {
	asset: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(assetSchema))

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

		const item = await db.query.assetTable.findFirst({
			where: eq(assetTable.assetid, Number(params.assetid)),
			columns: {
				limited: true
			}
		})

		if (!item) {
			return fail(404, {
				form
			})
		}

		if (item.limited && data.limited === true) {
			data.limited = false
		}

		await updateAsset(
			data.description,
			data.onsale,
			data.price,
			data.genres,
			data.name,
			Number(params.assetid),
			data.limited
		)

		return { form }
	},
	gear: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(gearSchema))

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

		const item = await db.query.assetTable.findFirst({
			where: eq(assetTable.assetid, Number(params.assetid)),
			columns: {
				limited: true
			}
		})

		if (!item) {
			return fail(404, {
				form
			})
		}

		if (item.limited && data.limited === false) {
			return setError(form, 'limited', 'This item is already limited.')
		}

		await db
			.update(assetTable)
			.set({
				description: data.description,
				onsale: data.onsale,
				price: data.price,
				genres: data.genres,
				gearattributes: data.gearattributes,
				assetname: data.name,
				updated: new Date(),
				limited: data.limited ? 'limited' : undefined
			})
			.where(eq(assetTable.assetid, Number(params.assetid)))

		return { form }
	}
}
