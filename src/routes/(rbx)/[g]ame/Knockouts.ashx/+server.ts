import { db } from '$lib/server/db'
import { usersTable } from '$lib/server/schema'
import { error, text, type RequestHandler } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

const userIdSchema = z.coerce.number().int().positive()

export const POST: RequestHandler = async ({ url }) => {
	const result = await userIdSchema.safeParseAsync(url.searchParams.get('UserID'))

	if (!result.success) {
		return error(400, { success: false, message: 'Malformed input.' })
	}

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, result.data),
		columns: {
			knockouts: true
		}
	})

	if (!user) {
		return error(404, { success: false, message: 'User not found.' })
	}

	await db
		.update(usersTable)
		.set({
			knockouts: sql`${usersTable.knockouts} + 1`
		})
		.where(eq(usersTable.userid, result.data))

	return text('')
}
