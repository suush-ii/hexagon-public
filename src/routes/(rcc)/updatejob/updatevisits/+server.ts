import { error, json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { gamesTable, jobsTable } from '$lib/server/schema'
import { and, eq } from 'drizzle-orm'

export const POST: RequestHandler = async ({ request }) => {
	const jobid = (await request.json()).jobid

	const instance = await db.query.jobsTable.findFirst({
		where: and(eq(jobsTable.jobid, jobid), eq(jobsTable.type, 'game')),
		columns: {},
		with: {
			associatedplace: {
				columns: {},
				with: { associatedgame: { columns: { visits: true, universeid: true } } }
			}
		}
	})

	if (!instance) {
		return error(404, {
			success: false,
			message: 'Job not found',
			data: {}
		})
	}

	await db
		.update(gamesTable)
		.set({ visits: Number(instance?.associatedplace?.associatedgame.visits) + 1 })
		.where(eq(gamesTable.universeid, Number(instance?.associatedplace?.associatedgame.universeid)))

	return json({
		success: true,
		message: '',
		data: {}
	})
}
