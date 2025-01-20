import { db } from '$lib/server/db'
import { env } from '$env/dynamic/private'
import { jobsTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { deleteJob } from '$lib/games/deleteJob'

export async function shutdown(gameid: number) {
	await db
		.update(jobsTable)
		.set({
			closed: true
		})
		.where(eq(jobsTable.associatedid, gameid))

	const jobs = await db.query.jobsTable.findMany({
		where: eq(jobsTable.associatedid, gameid),
		columns: {
			jobid: true,
			players: true
		},
		limit: 10
	})

	for (const job of jobs) {
		const response = await fetch(`http://${env.ARBITER_HOST}/closejob/${job.jobid}/${gameid}/2014`)

		const result = await response.json()

		if (result.success === false) {
			await deleteJob(job.jobid, job.players)
		}
	}
}
