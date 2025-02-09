import { zod } from 'sveltekit-superforms/adapters'
import type { PageServerLoad, Actions } from './$types'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { formSchema as gamepassSchema } from '$src/lib/schemas/gamepassschema'
import { _assetSchema } from '../../../../+layout.server'
import { fail } from 'sveltekit-superforms'
import { db } from '$lib/server/db'
import { and, count, eq } from 'drizzle-orm'
import { assetTable, gamesTable, inventoryTable } from '$lib/server/schema'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { uploadAsset } from '$lib/server/develop/uploadasset'
import { error, redirect } from '@sveltejs/kit'

const limiter = new RateLimiter({
	IP: [1, '15s']
})

export const load: PageServerLoad = async ({ params, locals }) => {
	const gamepassForm = await superValidate(zod(gamepassSchema))

	const asset = await db.query.gamesTable.findFirst({
		where: eq(gamesTable.universeid, Number(params.assetid)),
		columns: {
			creatoruserid: true
		}
	})

	if (!asset) {
		return error(404, { success: false, message: 'Asset not found!' })
	}

	if (asset.creatoruserid != locals.user.userid) {
		return error(403, { success: false, message: 'You do not have permission to edit this asset!' })
	}

	return {
		gamepassForm
	}
}

export const actions: Actions = {
	default: async (event) => {
		const { request, params, locals } = event

		const formData = await request.formData()
		const form = await superValidate(formData, zod(gamepassSchema))

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

		const asset = await db.query.gamesTable.findFirst({
			where: eq(gamesTable.universeid, Number(params.assetid)),
			columns: {
				creatoruserid: true
			}
		})

		if (!asset) {
			return error(404, { success: false, message: 'Asset not found!' })
		}

		if (asset.creatoruserid != locals.user.userid) {
			return error(403, {
				success: false,
				message: 'You do not have permission to edit this asset!'
			})
		}

		const [gamepassCount] = await db
			.select({ count: count() })
			.from(assetTable)
			.where(
				and(
					eq(assetTable.associatedgameid, Number(params.assetid)),
					eq(assetTable.assetType, 'gamepasses')
				)
			)
			.limit(1)

		if (gamepassCount.count >= 10) {
			return setError(form, 'asset', 'You have reached the maximum number of passes for this game!')
		}

		if (await limiter.isLimited(event)) {
			return setError(form, 'asset', 'Your uploading too fast!')
		}

		const file = form.data.asset
		const assetid = await uploadAsset(
			file,
			'gamepasses',
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
				itemtype: 'gamepasses'
			})
		}

		return redirect(302, '/develop/' + 'gamepasses')
	}
}
