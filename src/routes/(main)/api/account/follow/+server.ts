import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { relationsTable } from '$lib/server/schema'
import { and, eq, ne, or } from 'drizzle-orm'
import { z } from 'zod'

const itemSchema = z.object({
	recipientid: z.number().int(),
	type: z.enum(['follow', 'unfollow'])
})

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	let recipientid: number
	let type: 'follow' | 'unfollow'
	let result
	try {
		;({ recipientid, type } = await request.json())
		result = await itemSchema.safeParseAsync({ recipientid, type })
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const both = or(
		and(eq(relationsTable.sender, user.userid), eq(relationsTable.recipient, recipientid)),
		and(eq(relationsTable.sender, recipientid), eq(relationsTable.recipient, user.userid))
	)

	if (type === 'follow') {
		await db
			.insert(relationsTable)
			.values({ recipient: recipientid, sender: user.userid, type: type })
	} else {
		await db.delete(relationsTable).where(and(both, eq(relationsTable.type, 'follow')))
	}

	return json({
		success: true,
		message: 'Done!',
		data: {}
	})
}
