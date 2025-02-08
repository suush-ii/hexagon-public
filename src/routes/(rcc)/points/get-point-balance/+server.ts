import { db } from '$src/lib/server/db'
import { pointsTable } from '$src/lib/server/schema'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const pointBalanceSchema = z.object({
	userid: z.coerce.number().int(),
	placeid: z.coerce.number().int()
})

export const GET: RequestHandler = async ({ url }) => {
	const result = await pointBalanceSchema.safeParseAsync({
		userid: url.searchParams.get('userId'),
		placeid: url.searchParams.get('placeId')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { userid, placeid } = result.data

	const points = await db.query.pointsTable.findFirst({
		where: and(eq(pointsTable.userid, userid), eq(pointsTable.placeid, placeid))
	})

	return json({
		success: true,
		pointBalance: points?.amount ?? 0
	})
}
