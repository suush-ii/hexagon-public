import { json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { gamesTable, jobsTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'

export const POST: RequestHandler = async ({ request }) => {
	const { jobid, player, action } = await request.json()

	const instance = await db.query.jobsTable.findFirst({
		columns: { players: true, associatedid: true },
		where: eq(jobsTable.jobid, jobid),
		with: {
			associatedplace: { columns: {}, with: { associatedgame: { columns: { active: true } } } }
		}
	})

	if (!instance) {
		return json({
			success: false,
			message: 'Job not found',
			data: {}
		})
	}

	let active = instance?.associatedplace?.associatedgame.active ?? 0

	let playerCountUniverse = (
		await db.select({ active: gamesTable.active }).from(gamesTable).limit(1)
	)[0].active

	if (action === 'joining') {
		instance?.players?.push(player)

		active += 1
		playerCountUniverse += 1
	}

	if (action === 'leaving') {
		const index = instance?.players?.indexOf(player) ?? 0
		if (index > -1) {
			// only splice array when item is found
			instance?.players?.splice(index, 1) // 2nd parameter means remove one item only
		}

		active -= 1
		playerCountUniverse -= 1
	}

	await db
		.update(jobsTable)
		.set({ players: instance?.players, active })
		.where(eq(jobsTable.jobid, jobid))

	await db
		.update(gamesTable)
		.set({ active: playerCountUniverse })
		.where(eq(gamesTable.universeid, Number(instance?.associatedid)))

	return json({
		success: true,
		message: '',
		data: {}
	})
}
