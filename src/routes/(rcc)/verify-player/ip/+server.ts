import { db } from '$lib/server/db'
import { usersTable } from '$lib/server/schema'
import { json, type RequestHandler } from '@sveltejs/kit'
import { eq, or, and, isNull } from 'drizzle-orm'

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json()

	let { ip, userid } = body

	const result = await db
		.select({ lastip: usersTable.lastip })
		.from(usersTable)
		.where(
			and(
				or(eq(usersTable.lastip, ip), eq(usersTable.registerip, ip)),
				isNull(usersTable.banid),
				eq(usersTable.userid, userid)
			)
		)
		.limit(1)

	if (result.length === 0) {
		return json({ success: false })
	}

	return json({ success: true })
}
