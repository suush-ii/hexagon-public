import { error, fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { formSchema as assetSchema } from '$src/lib/schemas/edit/editassetschema'
import { formSchema as gearSchema } from '$src/lib/schemas/edit/editgearschema'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'
import { assetTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { _assetSchema } from '../../+layout.server'
import type { AssetGenreDB, GearAttributes } from '$lib/types'

export const load: PageServerLoad = async ({ params, locals }) => {
	const result = await z.number().safeParseAsync(Number(params.assetid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	let name = ''
	let description = ''
	let onsale = true
	let price = 0
	let genres: AssetGenreDB[] = []
	let gearattributes: GearAttributes[] = []

	if (params.item === 'gears' || params.item === 'faces' || params.item === 'hats') {
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
				gearattributes: assetTable.gearattributes
			})
			.from(assetTable)
			.where(eq(assetTable.assetid, result.data))
			.limit(1)

		if (asset.length === 0 || asset[0].assettype !== params.item) {
			error(404, { success: false, message: 'Asset not found.' })
		}

		if (asset[0].creatoruserid !== Number(locals.user.userid)) {
			error(403, { success: false, message: 'You do not have permission to edit this asset.' })
		}

		if (asset[0].moderationstate === 'rejected') {
			error(403, { success: false, message: 'This asset has been moderated.' })
		}

		name = asset[0].assetname
		description = asset[0].description ?? ''
		onsale = asset[0].onsale
		price = asset[0].price ?? 0
		genres = asset[0].genres
		gearattributes = asset[0].gearattributes ?? []
	}
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
		gearattributes
	}
}

async function updateAsset(
	description: string,
	onsale: boolean,
	price: number,
	genres: AssetGenreDB[],
	assetname: string,
	assetid: number
) {
	await db
		.update(assetTable)
		.set({
			description,
			onsale,
			price,
			genres,
			assetname
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

		await updateAsset(
			data.description,
			data.onsale,
			data.price,
			data.genres,
			data.name,
			Number(params.assetid)
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

		await db
			.update(assetTable)
			.set({
				description: data.description,
				onsale: data.onsale,
				price: data.price,
				genres: data.genres,
				gearattributes: data.gearattributes,
				assetname: data.name
			})
			.where(eq(assetTable.assetid, Number(params.assetid)))

		return { form }
	}
}
