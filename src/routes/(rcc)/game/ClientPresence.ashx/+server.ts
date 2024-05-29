import { error, json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { gamesTable, jobsTable, usersTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'

import { z } from 'zod'

const presenceSchema = z.object({
	action: z.enum(['connect', 'disconnect']),
	placeid: z.coerce.number().int().positive(),
	jobId: z.string().uuid(),
	userid: z.coerce.number().int().positive()
})

export const POST: RequestHandler = async ({ url }) => {
	const result = await presenceSchema.safeParseAsync({
		action: url.searchParams.get('action'),
		placeid: url.searchParams.get('PlaceID'),
		jobId: url.searchParams.get('JobID'),
		userid: url.searchParams.get('UserID')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { action, placeid, jobId, userid } = result.data

	const instance = await db.query.jobsTable.findFirst({
		columns: { players: true, associatedid: true },
		where: eq(jobsTable.jobid, jobId),
		with: {
			associatedplace: { columns: {}, with: { associatedgame: { columns: { active: true } } } }
		}
	})

	if (!instance) {
		return error(404, {
			success: false,
			message: 'Job not found',
			data: {}
		})
	}

	let active = instance?.players?.length ?? 0

	let playerCountUniverse = (
		await db.select({ active: gamesTable.active }).from(gamesTable).limit(1)
	)[0].active

	if (action === 'connect') {
		instance?.players?.push(userid)

		active += 1
		playerCountUniverse += 1

		await db.update(usersTable).set({ activegame: placeid }).where(eq(usersTable.userid, userid))
	}

	if (action === 'disconnect') {
		const index = instance?.players?.indexOf(userid) ?? 0
		if (index > -1) {
			// only splice array when item is found
			instance?.players?.splice(index, 1) // 2nd parameter means remove one item only
		}

		if (active > 0) {
			active -= 1
		}

		if (playerCountUniverse > 0) {
			playerCountUniverse -= 1
		}

		await db.update(usersTable).set({ activegame: null }).where(eq(usersTable.userid, userid))
	}

	await db
		.update(jobsTable)
		.set({ players: instance?.players, active })
		.where(eq(jobsTable.jobid, jobId))

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
