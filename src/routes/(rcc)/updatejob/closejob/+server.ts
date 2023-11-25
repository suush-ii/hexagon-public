import { json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { jobsTable } from '$lib/server/schema'
import { and, eq } from 'drizzle-orm'
import { GAMESERVER_IP } from '$env/static/private'

export const POST: RequestHandler = async ({ request, fetch }) => {
	const jobid = (await request.json()).jobid

	const instance = await db.query.jobsTable.findFirst({
		where: and(eq(jobsTable.jobid, jobid), eq(jobsTable.type, 'game'))
	})

	if (!instance) {
		return json({
			success: false,
			message: 'Invalid Jobid',
			data: {}
		})
	}

	await db.delete(jobsTable).where(eq(jobsTable.jobid, jobid))

	await fetch(`http://${GAMESERVER_IP}:8000/closejob/${jobid}/${instance.placeid}/2016`)

	return json({
		success: true,
		message: '',
		data: {}
	})
}
