import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { jobsTable, usersTable } from '$src/lib/server/schema'
import { and, eq } from 'drizzle-orm'
import { renderClear } from '$lib/server/renderClear'
import { z } from 'zod'
import { posesZod } from '$lib'

const poseSchema = z.object({
	pose: z.enum(posesZod)
})

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	let result
	try {
		const json = await request.json()
		result = await poseSchema.safeParseAsync(json)
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	await renderClear(user.userid)

	await db
		.update(usersTable)
		.set({
			avatarbody: null,
			avatarheadshot: null,
			_3dmanifest: null,
			pose: result.data.pose
		})
		.where(eq(usersTable.userid, user.userid))

	return json({ success: true, message: '', data: {} })
}
