import type { PageServerLoad, Actions } from './$types'
import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms/server'
import { fail } from 'sveltekit-superforms'
import { formSchema as gameSchema } from '$lib/schemas/gameschema'
import { formSchema as clothingSchema } from '$lib/schemas/clothingschema'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'
import { redirect } from '@sveltejs/kit'
import { _uploadableAssets } from '../+layout.server'
import { _assetSchema } from '../+layout.server'
import { zod } from 'sveltekit-superforms/adapters'
import { uploadAsset } from '$lib/server/develop/uploadasset'

export const load: PageServerLoad = async () => {
	const gameForm = await superValidate(zod(gameSchema))
	const clothingForm = await superValidate(zod(clothingSchema))
	const assetForm = await superValidate(zod(assetSchema))

	return {
		gameForm,
		clothingForm,
		assetForm
	}
}

export const actions: Actions = {
	game: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(gameSchema))

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
		uploadAsset(file, params.item, form, locals.user.userid)
		return redirect(302, '/develop/' + params.item)
	},
	clothing: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(clothingSchema))

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
		uploadAsset(file, params.item, form, locals.user.userid)
		return redirect(302, '/develop/' + params.item)
	},
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
		uploadAsset(file, params.item, form, locals.user.userid)

		return redirect(302, '/develop/' + params.item)
	}
}
