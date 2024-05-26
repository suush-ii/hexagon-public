import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { assetTable } from '$src/lib/server/schema/assets'
import { inArray, eq } from 'drizzle-orm'
import { z } from 'zod'
import type { assetStates } from '$src/lib/types'
import { S3 } from '$lib/server/s3'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName } from '$src/stores'
import { adminLogsTable } from '$src/lib/server/schema'

const approveAssetsSchema = z.object({
	moderationState: z.enum(['pending', 'approved', 'rejected', 'deleted']),
	assetId: z.coerce.number().int(),
	punish: z.boolean()
})

export const POST: RequestHandler = async ({ request, locals }) => {
	let assets: {
		assetId: number
		moderationState: assetStates
		punish: boolean
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
			assetType: assetTable.assetType,
			simpleAssetUrl: assetTable.simpleasseturl
		})
		.from(assetTable)
		.where(inArray(assetTable.assetid, assetIds))

	for (const asset of assetsDb) {
		if (asset.moderationState !== 'pending') {
			error(400, { success: false, message: 'Asset is not pending.', data: {} })
		}

		const newModerationState = assets.find((a) => a.assetId === asset.assetId)?.moderationState
		const punish = assets.find((a) => a.assetId === asset.assetId)?.punish

		if (newModerationState !== 'pending') {
			// avoid unnecessary updates
			await db
				.update(assetTable)
				.set({ moderationstate: newModerationState, topunish: punish })
				.where(eq(assetTable.assetid, asset.assetId))

			if (newModerationState === 'rejected') {
				const Key = asset.assetType

				const fileName = asset.simpleAssetUrl

				if (punish === false) {
					// we want to show this in user queue

					const command = new DeleteObjectCommand({
						Bucket: s3BucketName,
						Key: Key + '/' + fileName
					})
					try {
						await S3.send(command)
					} catch (err) {
						console.log(err)
					}
				}
			}

			const action = newModerationState === 'approved' ? 'approvedasset' : 'rejectedasset'

			if (asset.assetType === 'images') {
				const associatedAsset = await db
					.update(assetTable)
					.set({ moderationstate: newModerationState })
					.where(eq(assetTable.associatedimageid, asset.assetId)) // update the associated asset as well
					.returning({ assetId: assetTable.assetid })

				await db.insert(adminLogsTable).values({
					userid: locals.user.userid,
					associatedid: associatedAsset[0].assetId,
					associatedidtype: 'item',
					action
				})
			} else {
				await db.insert(adminLogsTable).values({
					userid: locals.user.userid,
					associatedid: asset.assetId,
					associatedidtype: 'item',
					action
				})
			}
		}
	}

	return json({ success: true, message: '', data: { url: '' } })
}
