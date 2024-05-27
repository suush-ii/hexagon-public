import { error, json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { gamesTable, jobsTable, usersTable } from '$lib/server/schema'
import { and, eq } from 'drizzle-orm'
import { GAMESERVER_IP, ARBITER_PORT } from '$env/static/private'

export const POST: RequestHandler = async ({ request, fetch }) => {
	const jobid = (await request.json()).jobid

	const instance = await db.query.jobsTable.findFirst({
		where: and(eq(jobsTable.jobid, jobid), eq(jobsTable.type, 'game')),
		columns: {
			placeid: true,
			players: true
		},
		with: {
			associatedplace: {
				columns: {},
				with: {
					associatedgame: {
						columns: {
							active: true,
							universeid: true
						}
					}
				}
			}
		}
	})

	fetch(`http://${GAMESERVER_IP}:${ARBITER_PORT}/closejob/${jobid}/${instance?.placeid ?? 0}/2016`)

	if (!instance) {
		return error(400, {
			success: false,
			message: 'Invalid Jobid',
			data: {}
		})
	}

	await db.delete(jobsTable).where(eq(jobsTable.jobid, jobid))

	if (instance.players && instance.players.length > 0) {
		for (const player of instance.players) {
			await db.update(usersTable).set({ activegame: null }).where(eq(usersTable.userid, player))
		}

		const newActive =
			Number(instance?.associatedplace?.associatedgame?.active) - instance.players.length

		await db
			.update(gamesTable)
			.set({ active: newActive })
			.where(eq(gamesTable.universeid, instance?.associatedplace?.associatedgame.universeid ?? 0))
	}

	return json({
		success: true,
		message: '',
		data: {}
	})
}
