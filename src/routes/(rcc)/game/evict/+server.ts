import { env } from '$env/dynamic/private'
import { db } from '$lib/server/db'
import { jobsTable, usersTable } from '$lib/server/schema'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

export const POST: RequestHandler = async ({ request }) => {
	const accessKey = request.headers.get('apikey')

	if (!accessKey || (env.EVICT_KEY as string) != accessKey) {
		return error(403, {
			success: false,
			message: 'Invalid session.',
			data: {}
		})
	}

	const body = await request.json()

	let { userid } = body

	const user = await db.query.usersTable.findFirst({
		columns: {
			activejob: true,
			activegame: true
		},
		where: eq(usersTable.userid, userid)
	})

	if (!user) {
		error(404, { success: false, message: 'User not found!' })
	}

	if (!user.activejob) {
		error(404, { success: false, message: 'User is not in a game!' })
	}

	const instance = await db.query.jobsTable.findFirst({
		columns: {
			toevict: true
		},
		where: eq(jobsTable.jobid, user.activejob)
	})

	if (!instance) {
		error(404, { success: false, message: 'Job not found!' })
	}

	await db
		.update(jobsTable)
		.set({
			toevict: instance.toevict ? [...instance.toevict, userid] : [userid]
		})
		.where(eq(jobsTable.jobid, user.activejob))

	return json({
		success: true,
		message: '',
		data: {}
	})
}
