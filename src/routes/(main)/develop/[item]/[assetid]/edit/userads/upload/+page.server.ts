import { zod } from 'sveltekit-superforms/adapters'
import type { PageServerLoad, Actions } from './$types'
import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms/server'
import { formSchema as userAdSchema } from '$src/lib/schemas/useradschema'
import { _assetSchema } from '../../../../+layout.server'
import { db } from '$lib/server/db'
import { and, count, eq } from 'drizzle-orm'
import { assetTable, gamesTable, userAdsTable } from '$lib/server/schema'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { uploadAsset } from '$lib/server/develop/uploadasset'
import { imageSize } from 'image-size'
import { error, redirect } from '@sveltejs/kit'
import type { AssetTypes } from '$src/lib/types'
import { fail } from 'sveltekit-superforms'

const limiter = new RateLimiter({
	IP: [1, '15s']
})

const validResolutions = [
	{ width: 300, height: 250 },
	{ width: 728, height: 90 },
	{ width: 160, height: 600 }
]

async function dimensionsCalc(file: File, form: SuperValidated<any, any, any>) {
	try {
		const dimensions = imageSize(new Uint8Array(await file.arrayBuffer()))

		if (!dimensions) {
			return setError(form, 'asset', 'Invalid image!')
		}

		if (
			!validResolutions.some((e) => e.width === dimensions.width && e.height === dimensions.height)
		) {
			return setError(form, 'asset', 'Invalid resolution!')
		}

		return dimensions.width
	} catch (e) {
		return setError(form, 'asset', 'Invalid image!')
	}
}

function adSize(width: number | undefined) {
	if (width === 300) return 'rectangle'
	if (width === 728) return 'banner'
	if (width === 160) return 'skyscraper'
	return 'skyscraper'
}

async function lookupAsset(assetid: number, userid: number) {
	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, assetid),
		columns: {
			creatoruserid: true,
			assetType: true
		}
	})

	if (!asset) {
		const game = await db.query.gamesTable.findFirst({
			where: eq(gamesTable.universeid, assetid),
			columns: {
				creatoruserid: true
			}
		})

		if (!game) {
			return error(404, { success: false, message: 'Asset not found!' })
		}

		if (game.creatoruserid != userid) {
			return error(403, {
				success: false,
				message: 'You do not have permission to edit this asset!'
			})
		}

		return assetid
	}

	return assetid
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const userAdForm = await superValidate(zod(userAdSchema))

	await lookupAsset(Number(params.assetid), locals.user.userid)

	return {
		userAdForm
	}
}

export const actions: Actions = {
	default: async (event) => {
		const { request, params, locals } = event

		const formData = await request.formData()
		const form = await superValidate(formData, zod(userAdSchema))

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

		await lookupAsset(Number(params.assetid), locals.user.userid)

		const [userAdsCount] = await db
			.select({ count: count() })
			.from(userAdsTable)
			.where(and(eq(userAdsTable.assocatedassetid, Number(params.assetid))))
			.limit(1)

		if (userAdsCount.count >= 5) {
			return setError(form, 'asset', 'You have reached the maximum number of ads for this asset!')
		}

		if (await limiter.isLimited(event)) {
			return setError(form, 'asset', 'Your uploading too fast!')
		}

		const file = form.data.asset

		const dimensions = await dimensionsCalc(file, form)

		const imageId = await uploadAsset(
			file,
			'images',
			form,
			locals.user.userid,
			undefined,
			Number(params.assetid)
		)

		if (!imageId) {
			return fail(500, {
				form
			})
		}

		await db.insert(userAdsTable).values({
			assetname: form.data.name,
			creatoruserid: locals.user.userid,
			associatedimageid: Number(imageId),
			assocatedassetid: Number(params.assetid),
			associatedassetype: result.data as AssetTypes,
			bidexpires: new Date(),
			adsize: adSize(Number(dimensions))
		})

		return redirect(302, '/develop/' + 'userads')
	}
}
