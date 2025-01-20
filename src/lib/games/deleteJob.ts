import { db } from '../server/db'
import { jobsTable, usersTable } from '../server/schema'
import { eq, inArray } from 'drizzle-orm'

export async function deleteJob(jobid: string, players: number[] | null) {
	await db.delete(jobsTable).where(eq(jobsTable.jobid, jobid))

	if (players && players.length > 0) {
		await db.transaction(async (tx) => {
			await tx
				.update(usersTable)
				.set({ activegame: null, activejob: null, gamepresenceping: null })
				.where(inArray(usersTable.userid, players))
		})
	}
}
