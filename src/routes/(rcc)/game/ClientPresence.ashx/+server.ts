import { error, json, text, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import {
	gamesessionsTable,
	gamesTable,
	jobsTable,
	placesTable,
	usersTable
} from '$lib/server/schema'
import { and, eq } from 'drizzle-orm'
import { env } from '$env/dynamic/private'
import { z } from 'zod'
import * as jose from 'jose'

const presenceSchema = z.object({
	action: z.enum(['connect', 'disconnect']).nullable(),
	placeid: z.coerce.number().int().positive(),
	jobId: z.string().uuid().nullable(),
	userid: z.coerce.number().int().positive().nullable(),
	locationType: z.enum(['Studio']).nullable()
})

export const fallback: RequestHandler = async ({ url, request, locals }) => {
	const result = await presenceSchema.safeParseAsync({
		action: url.searchParams.get('action'),
		placeid: url.searchParams.get('PlaceID'),
		jobId: url.searchParams.get('JobID'),
		userid: url.searchParams.get('UserID'),
		locationType: url.searchParams.get('LocationType')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { action, placeid, jobId, userid } = result.data

	if (result.data.locationType !== 'Studio') {
		const accessKey = url.searchParams.get('apikey') || request.headers.get('accessKey')

		try {
			const { payload } = await jose.jwtVerify(
				accessKey ?? '',
				new TextEncoder().encode(env.RCC_ACCESS_KEY as string)
			)

			const job = await db.query.jobsTable.findFirst({
				where: eq(jobsTable.jobid, (payload?.jobid ?? '') as string),
				columns: {
					placeid: true,
					status: true
				}
			})

			if (!job || job.placeid != placeid) {
				return error(403, {
					success: false,
					message: 'Invalid session.',
					data: {}
				})
			}
		} catch {
			if (!accessKey || (env.RCC_ACCESS_KEY as string) != accessKey) {
				return error(403, {
					success: false,
					message: 'Invalid session.',
					data: {}
				})
			}
		}
	}

	if (result.data.locationType === 'Studio') {
		const user = locals.user

		if (!user) {
			error(401, { success: false, message: 'No session.', data: {} })
		}

		const place = await db.query.placesTable.findFirst({
			where: eq(placesTable.placeid, placeid),
			columns: {},
			with: {
				associatedgame: {
					columns: {
						creatoruserid: true
					}
				}
			}
		})

		if (!place) {
			return error(404, {
				success: false,
				message: 'Place not found',
				data: {}
			})
		}

		if (place.associatedgame.creatoruserid != user.userid) {
			return error(403, {
				success: false,
				message: 'Unauthorized',
				data: {}
			})
		}

		await db
			.update(usersTable)
			.set({ studiopresencelocation: placeid, studiopresenceping: new Date() })
			.where(eq(usersTable.userid, user.userid))

		return text('')
	}

	if (!jobId || !userid || !placeid || !action) {
		return error(400, {
			success: false,
			message: 'Missing parameters for rcc.',
			data: {}
		})
	}

	const instance = await db.query.jobsTable.findFirst({
		columns: { players: true, associatedid: true, toevict: true },
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

	let playerCountUniverse = instance?.associatedplace?.associatedgame?.active ?? 0

	if (action === 'connect') {
		instance?.players?.push(userid)

		active += 1
		playerCountUniverse += 1

		await db
			.update(usersTable)
			.set({ activegame: placeid, activejob: jobId })
			.where(eq(usersTable.userid, userid))
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

		await db
			.update(usersTable)
			.set({ activegame: null, activejob: null })
			.where(eq(usersTable.userid, userid))

		const updatedToevict = instance.toevict ? instance.toevict.filter((id) => id !== userid) : []

		await db.update(jobsTable).set({ toevict: updatedToevict }).where(eq(jobsTable.jobid, jobId))

		await db
			.update(gamesessionsTable)
			.set({ active: false })
			.where(and(eq(gamesessionsTable.jobid, jobId), eq(gamesessionsTable.userid, userid)))
	}

	await db
		.update(jobsTable)
		.set({ players: instance?.players, active })
		.where(eq(jobsTable.jobid, jobId))

	await db
		.update(gamesTable)
		.set({ active: Math.max(playerCountUniverse, 0) })
		.where(eq(gamesTable.universeid, Number(instance?.associatedid)))

	return json({
		success: true,
		message: '',
		data: {}
	})
}
