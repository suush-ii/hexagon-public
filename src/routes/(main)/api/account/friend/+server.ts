import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { relationsTable } from '$lib/server/schema'
import { and, eq, ne, or } from 'drizzle-orm'
import { z } from 'zod'

const itemSchema = z.object({
	recipientid: z.number().int(),
	type: z.enum(['friend', 'unfriend'])
})

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	let recipientid: number
	let type: 'friend' | 'unfriend'
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

	const alreadyFriends = await db
		.select({})
		.from(relationsTable)
		.where(and((eq(relationsTable.sender, recipientid), eq(relationsTable.type, 'friend'))))
		.limit(1)

	if (alreadyFriends.length > 0 && type === 'friend') {
		error(400, { success: false, message: 'Already friends', data: {} })
	}

	const alreadyRequested = await db
		.select({})
		.from(relationsTable)
		.where(and(eq(relationsTable.sender, user.userid), eq(relationsTable.type, 'request')))
		.limit(1)

	if (alreadyRequested.length > 0 && type === 'friend') {
		error(400, { success: false, message: 'Pending', data: {} })
	}

	const recipientAlreadyRequested = await db
		.select({})
		.from(relationsTable)
		.where(and(eq(relationsTable.sender, recipientid), eq(relationsTable.type, 'request')))
		.limit(1)

	if (type === 'friend' && recipientAlreadyRequested.length === 0) {
		await db
			.insert(relationsTable)
			.values({ recipient: recipientid, sender: user.userid, type: 'request' })
	} else if (type === 'friend' && recipientAlreadyRequested.length > 0) {
		await db
			.update(relationsTable)
			.set({ recipient: user.userid, sender: recipientid, type: type })
			.where(
				and(
					eq(relationsTable.sender, recipientid),
					eq(relationsTable.recipient, user.userid),
					eq(relationsTable.type, 'request')
				)
			)
		await db
			.insert(relationsTable)
			.values({ sender: user.userid, recipient: recipientid, type: type }) // create 2 way
	} else {
		//unfriend

		await db.delete(relationsTable).where(
			and(
				eq(relationsTable.sender, recipientid),
				eq(relationsTable.recipient, user.userid),
				or(eq(relationsTable.type, 'friend'), eq(relationsTable.type, 'request')) // deny requests
			)
		)
		await db
			.delete(relationsTable)
			.where(
				and(
					eq(relationsTable.sender, user.userid),
					eq(relationsTable.recipient, recipientid),
					eq(relationsTable.type, 'friend')
				)
			)
	}

	return json({
		success: true,
		message: 'Done!',
		data: {}
	})
}
