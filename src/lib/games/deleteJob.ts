import { db } from '../server/db'
import { gamesTable, jobsTable, usersTable } from '../server/schema'
import { eq, inArray } from 'drizzle-orm'

export async function deleteJob(
	jobid: string,
	players: number[] | null,
	universeid: number,
	active: number
) {
	await db.delete(jobsTable).where(eq(jobsTable.jobid, jobid))

	if (players && players.length > 0) {
		await db.transaction(async (tx) => {
			await tx
				.update(usersTable)
				.set({ activegame: null, activejob: null, gamepresenceping: null })
				.where(inArray(usersTable.userid, players))

			const newActive = Math.max(Number(active) - players.length, 0)

			await tx
				.update(gamesTable)
				.set({ active: newActive })
				.where(eq(gamesTable.universeid, universeid))
		})
	}
}
