import { db } from '$lib/server/db'
import { placesTable, logsTable } from '$lib/server/schema'
import { type RequestHandler, error, text } from '@sveltejs/kit'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import pako from 'pako'

const logSchema = z.record(z.coerce.number(), z.string().array())

const logSchemaUrl = z.object({
	jobId: z.string().uuid(),
	placeId: z.coerce.number()
})

export const POST: RequestHandler = async ({ url, request }) => {
	const result = await logSchemaUrl.safeParseAsync({
		placeId: url.searchParams.get('placeId'),
		jobId: url.searchParams.get('jobId')
	})

	const request2 = request.clone()

	let file

	try {
		file = pako.inflate(Buffer.from(await request.arrayBuffer()), { to: 'string' }) // roblox compresses the json for some reason
	} catch {
		file = await request2.text()
	}

	const result2 = await logSchema.safeParseAsync(JSON.parse(file))

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	if (!result2.success) {
		const errors = result2.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { jobId, placeId } = result.data

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, placeId),
		columns: {
			universeid: true
		}
	})

	if (!place) {
		return error(404, { success: false, message: 'Place not found.' })
	}

	for (const [userId, logs] of Object.entries(result2.data)) {
		const log = await db.query.logsTable.findFirst({
			where: and(eq(logsTable.jobid, jobId), eq(logsTable.userid, Number(userId)))
		})

		if (log) {
			await db
				.update(logsTable)
				.set({
					log: logs.join('\n')
				})
				.where(and(eq(logsTable.jobid, jobId), eq(logsTable.userid, Number(userId))))
		} else {
			await db.insert(logsTable).values({
				jobid: jobId,
				userid: Number(userId),
				log: logs.join('\n')
			})
		}
	}

	return text('')
}
