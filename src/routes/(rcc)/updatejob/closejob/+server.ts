import { error, json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { gamesTable, jobsTable, usersTable } from '$lib/server/schema'
import { and, eq } from 'drizzle-orm'
import { env } from '$env/dynamic/private'
import { deleteJob } from '$lib/games/deleteJob'

export const POST: RequestHandler = async ({ request, fetch }) => {
	const jobid = (await request.json()).jobid

	const instance = await db.query.jobsTable.findFirst({
		where: and(eq(jobsTable.jobid, jobid), eq(jobsTable.type, 'game')),
		columns: {
			placeid: true,
			players: true
		}
	})

	fetch(`http://${env.ARBITER_HOST}/closejob/${jobid}/${instance?.placeid ?? 0}/2016`)

	if (!instance) {
		return error(400, {
			success: false,
			message: 'Invalid Jobid',
			data: {}
		})
	}

	await deleteJob(jobid, instance.players)

	return json({
		success: true,
		message: '',
		data: {}
	})
}
