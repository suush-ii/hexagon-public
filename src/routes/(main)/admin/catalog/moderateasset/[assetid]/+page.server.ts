import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { formSchema } from './schema'
import { assetTable } from '$lib/server/schema/assets'
import { error, redirect } from '@sveltejs/kit'
import { zod } from 'sveltekit-superforms/adapters'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { adminLogsTable } from '$src/lib/server/schema/users.js'

const limiter = new RateLimiter({
	IP: [1, '2m']
})

export const load: PageServerLoad = async ({ params }) => {
	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, Number(params.assetid)),
		columns: {
			moderationstate: true,
			assetname: true
		}
	})

	if (!asset) {
		return error(404, { success: false, message: 'Asset not found.', data: {} })
	}

	if (asset.moderationstate === 'rejected') {
		return error(403, {
			success: false,
			message: 'Already rejected.',
			data: {}
		})
	}

	return {
		asset,
		form: await superValidate(zod(formSchema))
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema))
		const { locals, params } = event

		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		if (await limiter.isLimited(event)) {
			return setError(form, 'scrubassetname', 'Your deleting too fast!')
		}

		//TODO: LOGS AND COMPLETE

		const asset = await db.query.assetTable.findFirst({
			where: eq(assetTable.assetid, Number(params.assetid)),
			columns: {
				assetname: true,
				assetid: true
			}
		})

		if (!asset) {
			return error(404, {
				success: false,
				message: 'Asset not found.',
				data: {}
			})
		}

		await db
			.update(assetTable)
			.set({
				moderationstate: 'rejected',
				onsale: false
			})
			.where(eq(assetTable.assetid, asset.assetid))

		if (form.data.scrubassetname) {
			await db
				.update(assetTable)
				.set({
					scrubbedassetname: asset.assetname,
					assetname: '[ Content Deleted ]',
					description: '[ Content Deleted ]'
				})
				.where(eq(assetTable.assetid, asset.assetid))
		}

		await db.insert(adminLogsTable).values({
			userid: locals.user.userid,
			associatedid: asset.assetid,
			associatedidtype: 'item',
			action: 'moderatedasset'
		})

		return redirect(302, `/catalog/${event.params.assetid}`)
	}
}
