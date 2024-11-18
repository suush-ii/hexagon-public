import { error, json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { gamesessionsTable } from '$lib/server/schema'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'

const presenceSchema = z.object({
	jobId: z.string().uuid().nullable(),
	userid: z.coerce.number().int().positive().nullable(),
	locationType: z.enum(['Studio']).nullable()
})

export const fallback: RequestHandler = async ({ url }) => {
	const result = await presenceSchema.safeParseAsync({
		jobId: url.searchParams.get('JobID'),
		userid: url.searchParams.get('UserID'),
		locationType: url.searchParams.get('LocationType')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { jobId, userid } = result.data

	await db
		.update(gamesessionsTable)
		.set({ flagged: true })
		.where(
			and(eq(gamesessionsTable.jobid, jobId ?? ''), eq(gamesessionsTable.userid, Number(userid)))
		)

	return json({
		success: true,
		message: '',
		data: {}
	})
}
