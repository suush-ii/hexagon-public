import { legacyPersistenceTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { type RequestHandler, text, error } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const getBlobSchema = z.object({
	placeid: z.coerce.number().int().positive(),
	userid: z.coerce.number().int().positive()
})

export const GET: RequestHandler = async ({ url }) => {
	const result = await getBlobSchema.safeParseAsync({
		placeid: url.searchParams.get('placeid'),
		userid: url.searchParams.get('userid')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { placeid, userid } = result.data

	const existingData = await db
		.select({ data: legacyPersistenceTable.data })
		.from(legacyPersistenceTable)
		.where(
			and(eq(legacyPersistenceTable.placeid, placeid), eq(legacyPersistenceTable.userid, userid))
		)
		.limit(1)

	if (existingData.length > 0) {
		return text(existingData[0].data)
	}

	return text('<Table></Table>')
}
