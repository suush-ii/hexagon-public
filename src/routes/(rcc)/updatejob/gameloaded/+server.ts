import { json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { jobsTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'

export const POST: RequestHandler = async ({ request }) => {
	const jobid = (await request.json()).jobid

	await db.update(jobsTable).set({ status: 2 }).where(eq(jobsTable.jobid, jobid))

	return json({
		success: true,
		message: '',
		data: {}
	})
}
