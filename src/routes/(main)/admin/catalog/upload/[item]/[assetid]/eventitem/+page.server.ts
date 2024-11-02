import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import { count, eq } from 'drizzle-orm'
import { assetTable, eventItemsTable } from '$lib/server/schema/assets'
import { error, fail, redirect } from '@sveltejs/kit'
import { adminAssets } from '../../'
import { formSchema as eventItemSchema } from '$lib/schemas/edit/admin/eventitemschema'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'

export const load: PageServerLoad = async ({ params }) => {
	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, Number(params.assetid)),
		columns: { assetType: true }
	})

	if (!asset) {
		return error(404, { success: false, message: 'Asset not found.', data: {} })
	}

	if (!adminAssets.includes(asset.assetType) || asset.assetType === 'packages') {
		return error(403, {
			success: false,
			message: 'You do not have permission to update this asset.',
			data: {}
		})
	}

	const eventItem = await db.query.eventItemsTable.findFirst({
		where: eq(eventItemsTable.badgeid, Number(params.assetid)),
		columns: { awardid: true }
	})

	return {
		eventItemForm: await superValidate(zod(eventItemSchema)),
		eventItem
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(eventItemSchema))

		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { params } = event

		const awardid = form.data.assetid

		const asset = await db.query.assetTable.findFirst({
			where: eq(assetTable.assetid, Number(params.assetid)),
			columns: { assetid: true }
		})

		if (!asset) {
			return error(404, { success: false, message: 'Asset not found.', data: {} })
		}

		if (awardid) {
			const reward = await db.query.assetTable.findFirst({
				where: eq(assetTable.assetid, awardid),
				columns: { assetType: true, limited: true }
			})

			if (!reward) {
				return setError(form, 'assetid', 'Reward not found.')
			}

			if (reward.limited) {
				return setError(form, 'assetid', 'Reward is limited.')
			}

			if (!adminAssets.includes(reward.assetType) || reward.assetType === 'packages') {
				return setError(form, 'assetid', 'You cannot reward this asset type.')
			}
		}

		if (!awardid) {
			await db.delete(eventItemsTable).where(eq(eventItemsTable.badgeid, Number(params.assetid)))

			return { form }
		}

		await db
			.insert(eventItemsTable)
			.values({ badgeid: Number(params.assetid), awardid })
			.onConflictDoUpdate({ target: eventItemsTable.badgeid, set: { awardid } })

		return { form }
	}
}
