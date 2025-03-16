import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { assetTable, inventoryTable, usersTable } from '$lib/server/schema'
import { count, eq } from 'drizzle-orm'
import { z } from 'zod'

const inventorySchema = z.object({
	userid: z.number().int(),
	page: z.number().int().optional()
})

export const POST: RequestHandler = async ({ request }) => {
	let requestJson

	try {
		requestJson = await request.json()
	} catch {
		return json({ success: false, message: 'Malformed JSON.', data: {} })
	}

	const result = await inventorySchema.safeParseAsync(requestJson)

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, result.data.userid)
	})

	if (!user) {
		return json({ success: false, message: 'User not found.', data: {} })
	}

	const size = 100

	let page = result.data.page || 1

	if (page < 1) {
		page = 1
	}

	const [inventoryCount] = await db
		.select({ count: count() })
		.from(inventoryTable)
		.innerJoin(assetTable, eq(inventoryTable.itemid, assetTable.assetid))
		.where(eq(inventoryTable.userid, result.data.userid))
		.limit(1)

	if (inventoryCount.count < (page - 1) * page) {
		page = 1
	}

	const nextPageCursor = page + 1 < inventoryCount.count / size ? page + 1 : null

	const inventory = await db
		.select({
			assetid: inventoryTable.itemid,
			assetname: assetTable.assetname,
			serialid: inventoryTable.serialid,
			obtaineddate: inventoryTable.obatineddate,
			wearing: inventoryTable.wearing,
			itemtype: inventoryTable.itemtype,
			limited: assetTable.limited
		})
		.from(inventoryTable)
		.innerJoin(assetTable, eq(inventoryTable.itemid, assetTable.assetid))
		.where(eq(inventoryTable.userid, result.data.userid))
		.limit(size)
		.offset((page - 1) * size)

	return json({ success: true, data: { inventory }, nextPageCursor })
}
