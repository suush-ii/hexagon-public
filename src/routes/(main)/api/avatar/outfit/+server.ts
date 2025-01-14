import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { z } from 'zod'
import { inventoryTable, outfitsTable, usersTable } from '$lib/server/schema'
import { eq, and, inArray, notInArray } from 'drizzle-orm'
import { renderClear } from '$lib/server/renderClear'

const outfitSchema = z.object({
	outfitId: z.coerce.number().int(),
	action: z.enum(['wear', 'update', 'delete'])
})

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	let result
	try {
		const outfit = await request.json()

		result = await outfitSchema.safeParseAsync(outfit)
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const outfit = await db.query.outfitsTable.findFirst({
		where: eq(outfitsTable.outfitid, result.data.outfitId),
		columns: {
			outfitid: true,
			ownerid: true,
			headcolor: true,
			leftarmcolor: true,
			leftlegcolor: true,
			rightarmcolor: true,
			rightlegcolor: true,
			torsocolor: true,
			assets: true,
			avatarbody: true
		}
	})

	if (!outfit) {
		error(404, { success: false, message: 'Outfit not found.', data: {} })
	}

	if (outfit.ownerid != user.userid) {
		error(401, { success: false, message: 'You do not own this outfit.', data: {} })
	}

	if (result.data.action === 'wear') {
		await renderClear(user.userid)

		await db
			.update(usersTable)
			.set({
				headcolor: outfit.headcolor!,
				leftarmcolor: outfit.leftarmcolor!,
				leftlegcolor: outfit.leftlegcolor!,
				rightarmcolor: outfit.rightarmcolor!,
				rightlegcolor: outfit.rightlegcolor!,
				torsocolor: outfit.torsocolor!,
				avatarbody: outfit.avatarbody!
			})
			.where(eq(usersTable.userid, user.userid))

		await db
			.update(inventoryTable)
			.set({ wearing: true })
			.where(
				and(eq(inventoryTable.userid, user.userid), inArray(inventoryTable.itemid, outfit.assets))
			)

		await db
			.update(inventoryTable)
			.set({ wearing: false })
			.where(
				and(
					eq(inventoryTable.userid, user.userid),
					notInArray(inventoryTable.itemid, outfit.assets)
				)
			)
	}

	if (result.data.action === 'delete') {
		await db.delete(outfitsTable).where(eq(outfitsTable.outfitid, result.data.outfitId))
	}

	if (result.data.action === 'update') {
		const inventoryWearing = await db
			.selectDistinctOn([inventoryTable.itemid], {
				itemid: inventoryTable.itemid
			})
			.from(inventoryTable)
			.where(and(eq(inventoryTable.wearing, true), eq(inventoryTable.userid, user.userid)))

		const bodycolor = await db.query.usersTable.findFirst({
			where: eq(usersTable.userid, user.userid),
			columns: {
				avatarbody: true,
				headcolor: true,
				leftarmcolor: true,
				leftlegcolor: true,
				rightarmcolor: true,
				rightlegcolor: true,
				torsocolor: true
			}
		})

		await db
			.update(outfitsTable)
			.set({ assets: inventoryWearing.map((item) => item.itemid), ...bodycolor })
			.where(eq(outfitsTable.outfitid, result.data.outfitId))
	}

	return json({ success: true, message: '', data: {} })
}
