import type { PageServerLoad, Actions } from './$types'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { fail } from 'sveltekit-superforms'
import { formSchema as placeSchema } from '$lib/schemas/placeschema'
import { redirect } from '@sveltejs/kit'
import { _uploadableAssets } from '../../../../+layout.server'
import { _assetSchema } from '../../../../+layout.server'
import { zod } from 'sveltekit-superforms/adapters'
import { uploadAsset } from '$lib/server/develop/uploadasset'
import { db } from '$src/lib/server/db'
import { placesTable } from '$src/lib/server/schema'
import { count, eq } from 'drizzle-orm'
import { RateLimiter } from 'sveltekit-rate-limiter/server'

const limiter = new RateLimiter({
	IP: [1, '15s']
})

export const load: PageServerLoad = async () => {
	const placeForm = await superValidate(zod(placeSchema))

	return {
		placeForm
	}
}

export const actions: Actions = {
	default: async (event) => {
		const { request, params, locals } = event

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

		const [placeCount] = await db
			.select({ count: count() })
			.from(placesTable)
			.where(eq(placesTable.universeid, Number(params.assetid)))
			.limit(1)

		if (!placeCount) {
			return setError(form, 'asset', 'Place not found!')
		}

		if (placeCount.count >= 5) {
			return setError(
				form,
				'geargenreenforced',
				'You have reached the maximum number of places for this game!'
			)
		}

		if (await limiter.isLimited(event)) {
			return setError(form, 'asset', 'Your uploading too fast!')
		}

		const file = form.data.asset
		await uploadAsset(
			file,
			params.item,
			form,
			locals.user.userid,
			undefined,
			Number(params.assetid)
		)
		return redirect(302, '/develop/' + params.item)
	}
}
