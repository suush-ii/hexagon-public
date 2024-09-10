import { db } from '$lib/server/db'
import { usersTable } from '$lib/server/schema'
import { json, type RequestHandler, text } from '@sveltejs/kit'
import { eq, or, and, isNull } from 'drizzle-orm'

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json()

	let { ip } = body

	ip = ip.split(':')[0]

	const result = await db
		.select({ lastip: usersTable.lastip })
		.from(usersTable)
		.where(
			and(or(eq(usersTable.lastip, ip), eq(usersTable.registerip, ip)), isNull(usersTable.banid))
		)
		.limit(1)

	if (result.length === 0) {
		return json({ success: false })
	}

	return json({ success: true })
}
