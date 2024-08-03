import { type RequestHandler, text, error } from '@sveltejs/kit'
import { z } from 'zod'
import { legacyPersistenceTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { eq, and } from 'drizzle-orm'

const setBlobSchema = z.object({
	placeid: z.coerce.number().int().positive(),
	userid: z.coerce.number().int().positive()
})

export const POST: RequestHandler = async ({ url, request }) => {
	const result = await setBlobSchema.safeParseAsync({
		placeid: url.searchParams.get('placeid'),
		userid: url.searchParams.get('userid')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { placeid, userid } = result.data

	const data = (await request.text()).replaceAll('\u0000', '')

	const where = and(
		eq(legacyPersistenceTable.placeid, placeid),
		eq(legacyPersistenceTable.userid, userid)
	)

	const existingData = await db.select({}).from(legacyPersistenceTable).where(where).limit(1)

	if (existingData.length > 0) {
		await db.update(legacyPersistenceTable).set({ data: data }).where(where)
	} else {
		await db.insert(legacyPersistenceTable).values({ placeid: placeid, userid: userid, data: data })
	}

	return text('')
}
