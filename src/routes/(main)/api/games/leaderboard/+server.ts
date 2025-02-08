import { db } from '$src/lib/server/db'
import { pointsTable } from '$src/lib/server/schema'
import { getPageNumber } from '$src/lib/utils'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import { count, eq, desc, sql } from 'drizzle-orm'
import { z } from 'zod'

const leaderboardSchema = z.object({
	placeid: z.coerce.number().int()
})

export const GET: RequestHandler = async ({ url }) => {
	const result = await leaderboardSchema.safeParseAsync({
		placeid: url.searchParams.get('placeId')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { placeid } = result.data

	let page = getPageNumber(url)

	const size = 30

	const [leaderboardCount] = await db
		.select({ count: count() })
		.from(pointsTable)
		.where(eq(pointsTable.placeid, placeid))
		.limit(1)

	if (leaderboardCount.count < (page - 1) * size) {
		return json({ leaderboard: [] })
	}

	const leaderboard = await db.query.pointsTable.findMany({
		where: eq(pointsTable.placeid, placeid),
		orderBy: desc(pointsTable.amount),
		limit: size,
		columns: {
			amount: true
		},
		with: {
			associateduser: {
				columns: {
					username: true,
					userid: true
				}
			}
		},
		extras: {
			rank: sql<string>`rank() over (order by ${pointsTable.amount} desc)`.as('rank')
		},
		offset: (page - 1) * size
	})

	return json({ leaderboard })
}
