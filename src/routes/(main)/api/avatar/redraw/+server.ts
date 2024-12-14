import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { jobsTable, usersTable } from '$src/lib/server/schema'
import { and, eq } from 'drizzle-orm'
import { renderClear } from '$lib/server/renderClear'

export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	await renderClear(user.userid)

	await db
		.update(usersTable)
		.set({
			avatarbody: null,
			avatarheadshot: null,
			_3dmanifest: null
		})
		.where(eq(usersTable.userid, user.userid))

	await db
		.delete(jobsTable)
		.where(
			and(
				eq(jobsTable.associatedid, user.userid),
				eq(jobsTable.type, 'render'),
				eq(jobsTable.rendertype, 'user')
			)
		)

	return json({ success: true, message: '', data: {} })
}
