import { db } from '$src/lib/server/db'
import { pointsTable } from '$src/lib/server/schema'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const awardPointSchema = z.object({
	amount: z.coerce.number().int(),
	userid: z.coerce.number().int(),
	placeid: z.coerce.number().int()
})

export const POST: RequestHandler = async ({ url }) => {
	const result = await awardPointSchema.safeParseAsync({
		amount: url.searchParams.get('amount'),
		userid: url.searchParams.get('userId'),
		placeid: url.searchParams.get('placeId')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { amount, userid, placeid } = result.data

	const points = await db.query.pointsTable.findFirst({
		where: and(eq(pointsTable.userid, userid), eq(pointsTable.placeid, placeid))
	})

	if (points) {
		await db
			.update(pointsTable)
			.set({ amount: points.amount + amount })
			.where(and(eq(pointsTable.userid, userid), eq(pointsTable.placeid, placeid)))
	} else {
		await db.insert(pointsTable).values({ amount, userid, placeid })
	}

	return json({
		success: true,
		userBalance: points?.amount ?? amount,
		pointsAwarded: amount,
		userGameBalance: points?.amount ?? amount
	})
}
