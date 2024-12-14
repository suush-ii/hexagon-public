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
	jobId: z.string().uuid()
})

export const fallback: RequestHandler = async ({ url, request, locals }) => {
	const result = await presenceSchema.safeParseAsync({
		jobId: url.searchParams.get('jobId')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { jobId } = result.data

	const instance = await db.query.jobsTable.findFirst({
		columns: { players: true, associatedid: true, toevict: true, closed: true },
		where: eq(jobsTable.jobid, jobId)
	})

	if (!instance) {
		return error(404, {
			success: false,
			message: 'Job not found',
			data: {}
		})
	}

	await db.update(jobsTable).set({ presenceping: new Date() }).where(eq(jobsTable.jobid, jobId))

	return json({
		success: true,
		message: '',
		data: {},
		status: instance?.closed ? 'close' : '',
		evicted: instance?.toevict ?? []
	})
}
