import { db } from '$lib/server/db'
import { inventoryTable } from '$lib/server/schema'
import { type RequestHandler, error, json, text } from '@sveltejs/kit'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const ownershipSchema = z.object({
	assetid: z.coerce.number().int(),
	userid: z.coerce.number().int()
})

export const GET: RequestHandler = async ({ url }) => {
	const result = await ownershipSchema.safeParseAsync({
		assetid: url.searchParams.get('assetId'),
		userid: url.searchParams.get('userId')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { assetid, userid } = result.data

	const asset = await db.query.inventoryTable.findFirst({
		where: and(eq(inventoryTable.itemid, assetid), eq(inventoryTable.userid, userid))
	})

	if (!asset) {
		return text('false')
	}

	return text('true')
}
