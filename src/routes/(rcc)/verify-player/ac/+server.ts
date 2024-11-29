import { db } from '$lib/server/db'
import { jobsTable, usersTable } from '$lib/server/schema'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

export const GET: RequestHandler = async ({ locals }) => {
	const user = await db.query.usersTable.findFirst({
		columns: {
			activejob: true,
			activegame: true,
			userid: true
		},
		where: eq(usersTable.userid, locals.user.userid)
	})

	if (!user) {
		error(404, { success: false, message: 'User not found!' })
	}

	if (!user.activejob) {
		error(404, { success: false, message: 'User is not in a game!' })
	}

	const instance = await db.query.jobsTable.findFirst({
		columns: {
			associatedid: true
		},
		where: eq(jobsTable.jobid, user.activejob)
	})

	if (!instance) {
		error(404, { success: false, message: 'Job not found!' })
	}

	return json({
		success: true,
		message: '',
		data: { placeid: user.activegame, jobid: user.activejob, userid: user.userid }
	})
}
