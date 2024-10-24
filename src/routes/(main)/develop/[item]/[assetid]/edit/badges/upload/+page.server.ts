import { zod } from 'sveltekit-superforms/adapters'
import type { PageServerLoad, Actions } from './$types'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { formSchema as badgeSchema } from '$src/lib/schemas/badgeschema'
import { _assetSchema } from '../../../../+layout.server'
import { fail } from 'sveltekit-superforms'
import { db } from '$lib/server/db'
import { and, count, eq } from 'drizzle-orm'
import { assetTable, inventoryTable } from '$lib/server/schema'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { uploadAsset } from '$lib/server/develop/uploadasset'
import { redirect } from '@sveltejs/kit'

const limiter = new RateLimiter({
	IP: [1, '15s']
})

export const load: PageServerLoad = async () => {
	const badgeForm = await superValidate(zod(badgeSchema))

	return {
		badgeForm
	}
}

export const actions: Actions = {
	default: async (event) => {
		const { request, params, locals } = event

		const formData = await request.formData()
		const form = await superValidate(formData, zod(badgeSchema))

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

		const [badgeCount] = await db
			.select({ count: count() })
			.from(assetTable)
			.where(
				and(
					eq(assetTable.associatedgameid, Number(params.assetid)),
					eq(assetTable.assetType, 'badges')
				)
			)
			.limit(1)

		if (badgeCount.count >= 10) {
			return setError(form, 'asset', 'You have reached the maximum number of passes for this game!')
		}

		if (await limiter.isLimited(event)) {
			return setError(form, 'asset', 'Your uploading too fast!')
		}

		const file = form.data.asset
		const assetid = await uploadAsset(
			file,
			'badges',
			form,
			locals.user.userid,
			undefined,
			Number(params.assetid)
		)

		if (assetid) {
			await db.insert(inventoryTable).values({
				itemid: Number(assetid),
				userid: locals.user.userid,
				wearing: false,
				itemtype: 'badges'
			})
		}

		return redirect(302, '/develop/' + 'badges')
	}
}
