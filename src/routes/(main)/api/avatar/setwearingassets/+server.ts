import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { z } from 'zod'
import { inventoryTable, usersTable } from '$lib/server/schema'
import { eq, and } from 'drizzle-orm'
import type { AssetTypes } from '$lib/types'

const itemSchema = z.object({
	itemId: z.coerce.number().int(),
	wear: z.boolean()
})

const canOnlyWearOne: AssetTypes[] = [
	'shirts',
	'pants',
	'faces',
	'heads',
	't-shirts',
	'torsos',
	'l arms',
	'r arms',
	'l legs',
	'r legs',
	'packages'
]

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	let result
	try {
		let item = await request.json()

		result = await itemSchema.safeParseAsync(item)
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const wearingAssets = await db.query.inventoryTable.findMany({
		where: and(eq(inventoryTable.userid, user.userid), eq(inventoryTable.wearing, true)),
		with: {
			asset: {
				columns: {
					assetType: true
				}
			}
		}
	})

	const wearingCount = wearingAssets.filter((w) => !canOnlyWearOne.includes(w.asset.assetType)) // we only care about accessories like hats and gears

	if (wearingCount.length >= 10 && result.data.wear === true) {
		return error(400, {
			success: false,
			message: 'You can only wear up to 10 accessories.',
			data: {}
		})
	}

	const item = await db.query.inventoryTable.findFirst({
		where: and(
			eq(inventoryTable.userid, user.userid),
			eq(inventoryTable.itemid, result.data.itemId)
		),
		columns: {
			itemid: true
		},
		with: {
			asset: {
				columns: {
					assetType: true,
					moderationstate: true
				}
			}
		}
	})

	if (!item) {
		return error(400, { success: false, message: "You don't own this!", data: {} })
	}

	if (item.asset.moderationstate !== 'approved') {
		return error(400, { success: false, message: 'This asset is not approved.', data: {} })
	}

	if (canOnlyWearOne.includes(item.asset.assetType)) {
		// can only wear one shirt and one pants
		const wearing = wearingAssets.find((w) => w.asset.assetType === item.asset.assetType)

		if (wearing) {
			await db
				.update(inventoryTable)
				.set({
					wearing: false
				})
				.where(
					and(eq(inventoryTable.userid, user.userid), eq(inventoryTable.itemid, wearing.itemid))
				)
		}
	}

	await db
		.update(inventoryTable)
		.set({
			wearing: result.data.wear
		})
		.where(
			and(eq(inventoryTable.userid, user.userid), eq(inventoryTable.itemid, result.data.itemId))
		)

	await db
		.update(usersTable)
		.set({ _3dmanifest: null, avatarbody: null, avatarheadshot: null })
		.where(eq(usersTable.userid, user.userid))

	return json({ success: true, message: '', data: {} })
}
