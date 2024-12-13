import { db } from '../server/db'
import { gamesTable, jobsTable, usersTable } from '../server/schema'
import { eq } from 'drizzle-orm'

export async function deleteJob(
	jobid: string,
	players: number[] | null,
	universeid: number,
	active: number
) {
	await db.delete(jobsTable).where(eq(jobsTable.jobid, jobid))

	if (players && players.length > 0) {
		for (const player of players) {
			await db.update(usersTable).set({ activegame: null }).where(eq(usersTable.userid, player))
		}

		const newActive = Math.max(Number(active) - players.length, 0)

		await db
			.update(gamesTable)
			.set({ active: newActive })
			.where(eq(gamesTable.universeid, universeid))
	}
}
