import { db } from '$lib/server/db'
import { error, text, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { inventoryTable } from '$lib/server/schema'

const gamepassSchema = z.object({
	gamepassid: z.coerce.number().int(),
	userid: z.coerce.number().int()
})

export const fallback: RequestHandler = async ({ url }) => {
	const result = await gamepassSchema.safeParseAsync({
		gamepassid: url.searchParams.get('PassID'),
		userid: url.searchParams.get('UserID')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { gamepassid, userid } = result.data

	const gamepass = await db.query.inventoryTable.findFirst({
		where: and(eq(inventoryTable.itemid, gamepassid), eq(inventoryTable.userid, userid))
	})

	if (!gamepass) {
		return text('<Value Type="boolean">false</Value>')
	}

	return text('<Value Type="boolean">true</Value>')
}
