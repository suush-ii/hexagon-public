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
import { assetTable, inventoryTable } from '$lib/server/schema'
import { db } from '$src/lib/server/db'
import { eq } from 'drizzle-orm'
import { RateLimiter } from 'sveltekit-rate-limiter/server'

const limiter = new RateLimiter({
	IP: [1, '15s']
})

async function giveItem(assetid: number, userid: number) {
	const item = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, assetid),
		columns: {
			assetType: true
		}
	})

	if (assetid && item) {
		await db.insert(inventoryTable).values({
			itemid: assetid,
			userid: userid,
			wearing: false,
			itemtype: item.assetType
		})
	}
}

export const load: PageServerLoad = async ({ params }) => {
	const gameForm = await superValidate(zod(gameSchema))
	const clothingForm = await superValidate(zod(clothingSchema))
	const assetForm = await superValidate(zod(assetSchema))

	if (
		params.item === 'gamepasses' ||
		params.item === 'badges' ||
		params.item === 'models' ||
		params.item === 'userads'
	) {
		return redirect(302, '/develop/' + params.item)
	}

	return {
		gameForm,
		clothingForm,
		assetForm
	}
}

export const actions: Actions = {
	game: async (event) => {
		const { request, params, locals } = event

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

		if (await limiter.isLimited(event)) {
			return setError(form, 'asset', 'Your uploading too fast!')
		}

		const file = form.data.asset
		await uploadAsset(file, params.item, form, locals.user.userid)
		return redirect(302, '/develop/' + params.item)
	},
	clothing: async (event) => {
		const { request, params, locals } = event

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

		if (await limiter.isLimited(event)) {
			return setError(form, 'asset', 'Your uploading too fast!')
		}

		const file = form.data.asset
		const assetid = await uploadAsset(file, params.item, form, locals.user.userid)

		await giveItem(Number(assetid), locals.user.userid)

		return redirect(302, '/develop/' + params.item)
	},
	asset: async (event) => {
		const { request, params, locals } = event

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

		if (await limiter.isLimited(event)) {
			return setError(form, 'asset', 'Your uploading too fast!')
		}

		const file = form.data.asset
		const assetid = await uploadAsset(file, params.item, form, locals.user.userid)

		await giveItem(Number(assetid), locals.user.userid)

		return redirect(302, '/develop/' + params.item)
	}
}
