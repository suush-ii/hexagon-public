import type { PageServerLoad, Actions } from './$types'
import { fail } from 'sveltekit-superforms'
import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'
import { formSchema as gearSchema } from '$lib/schemas/gearschema'
import { redirect } from '@sveltejs/kit'
import { uploadAsset } from '$lib/server/develop/uploadasset'
import { z } from 'zod'
import { adminLogsTable } from '$lib/server/schema'
import { db } from '$lib/server/db'

const _assetSchema = z.enum(['hats', 'faces', 'gears'])

export const load: PageServerLoad = async () => {
	const assetForm = await superValidate(zod(assetSchema))

	const gearForm = await superValidate(zod(gearSchema))

	return {
		assetForm,
		gearForm
	}
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

		const file = form.data.asset
		const assetid = await uploadAsset(file, params.item, form, locals.user.userid)

		const numAssetId = Number(assetid)

		await db.insert(adminLogsTable).values({
			userid: locals.user.userid,
			associatedid: numAssetId,
			associatedidtype: 'item',
			action: 'uploadasset'
		})

		return redirect(302, '/admin/catalog/upload/' + params.item)
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

		const file = form.data.asset
		const assetid = await uploadAsset(file, params.item, form, locals.user.userid)

		const numAssetId = Number(assetid)

		await db.insert(adminLogsTable).values({
			userid: locals.user.userid,
			associatedid: numAssetId,
			associatedidtype: 'item',
			action: 'uploadasset'
		})

		return redirect(302, '/admin/catalog/upload/' + params.item)
	}
}
