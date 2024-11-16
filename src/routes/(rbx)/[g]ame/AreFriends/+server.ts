import { db } from '$lib/server/db'
import { relationsTable } from '$lib/server/schema'
import { type RequestHandler, error, json, text } from '@sveltejs/kit'
import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

const areFriendsSchema = z.object({
	userId: z.coerce.number().int().positive(),
	otherUserIds: z.array(z.coerce.number().int().positive()).max(50)
})

export const GET: RequestHandler = async ({ url }) => {
	const result = await areFriendsSchema.safeParseAsync({
		userId: url.searchParams.get('userId'),
		otherUserIds: url.searchParams.getAll('otherUserIds')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs

		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { userId, otherUserIds } = result.data

	const friends = await db
		.select({ userId: relationsTable.recipient })
		.from(relationsTable)
		.where(
			and(
				eq(relationsTable.sender, userId),
				inArray(relationsTable.recipient, otherUserIds),
				eq(relationsTable.type, 'friend')
			)
		)
		.limit(50)

	const friendsMap = friends.map((item) => item.userId).join(',')

	return text(friendsMap)
}
