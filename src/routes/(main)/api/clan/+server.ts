import { db } from '$lib/server/db'
import { usersTable } from '$lib/server/schema'
import { type RequestHandler, error, text } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const POST: RequestHandler = async ({ url }) => {
	const result = await z.coerce.number().int().safeParseAsync(url.searchParams.get('userId'))

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const userid = result.data

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, userid),
		columns: {
			registeredclan: true
		}
	})

	if (!user || !user.registeredclan) {
		return text('none')
	}

	return text(user.registeredclan)
}
