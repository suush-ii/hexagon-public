import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { usersTable } from '$src/lib/server/schema'
import { eq } from 'drizzle-orm'

export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	await db
		.update(usersTable)
		.set({
			avatarbody: null,
			avatarheadshot: null,
			_3dmanifest: null
		})
		.where(eq(usersTable.userid, user.userid))

	return json({ success: true, message: '', data: {} })
}
