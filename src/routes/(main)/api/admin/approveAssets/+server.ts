import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { assetTable } from '$src/lib/server/schema/assets'
import { inArray, eq } from 'drizzle-orm'
import { z } from 'zod'
import type { assetStates } from '$src/lib/types'

const approveAssetsSchema = z.object({
	moderationState: z.enum(['pending', 'approved', 'rejected', 'deleted']),
	assetId: z.coerce.number().int()
})

export const POST: RequestHandler = async ({ request }) => {
	let assets: {
		assetId: number
		moderationState: assetStates
	}[]
	let result
	try {
		assets = await request.json()

		result = await z.array(approveAssetsSchema).safeParseAsync(assets)
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const assetIds = assets.map((asset) => asset.assetId)

	if (assetIds.length === 0) {
		error(400, { success: false, message: 'No assets provided.', data: {} })
	}

	const assetsDb = await db
		.select({
			assetId: assetTable.assetid,
			moderationState: assetTable.moderationstate,
			assetType: assetTable.assetType
		})
		.from(assetTable)
		.where(inArray(assetTable.assetid, assetIds))

	for (const asset of assetsDb) {
		if (asset.moderationState !== 'pending') {
			error(400, { success: false, message: 'Asset is not pending.', data: {} })
		}

		const newModerationState = assets.find((a) => a.assetId === asset.assetId)?.moderationState

		if (newModerationState !== 'pending') {
			// avoid unnecessary updates
			await db
				.update(assetTable)
				.set({ moderationstate: newModerationState })
				.where(eq(assetTable.assetid, asset.assetId))

			if (asset.assetType === 'images') {
				await db
					.update(assetTable)
					.set({ moderationstate: newModerationState })
					.where(eq(assetTable.associatedimageid, asset.assetId)) // update the associated clothing as well
			}
		}
	}

	return json({ success: true, message: '', data: { url: '' } })
}
