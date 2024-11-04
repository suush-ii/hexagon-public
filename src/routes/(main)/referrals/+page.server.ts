import { db } from '$lib/server/db'
import { applicationsTable } from '$lib/server/schema'
import { and, count, desc, eq, isNotNull } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import { getPageNumber } from '$lib/utils'

export const load: PageServerLoad = async ({ locals, url }) => {
	let page = getPageNumber(url)

	const size = 30

	const [referralCount] = await db
		.select({ count: count() })
		.from(applicationsTable)
		.where(
			and(
				eq(applicationsTable.refereruserid, locals.user.userid),
				eq(applicationsTable.accepted, true),
				isNotNull(applicationsTable.signupuserid)
			)
		)
		.limit(1)

	if (referralCount.count < (page - 1) * size) {
		page = 1
	}

	const referrals = await db.query.applicationsTable.findMany({
		where: and(
			eq(applicationsTable.refereruserid, locals.user.userid),
			eq(applicationsTable.accepted, true),
			isNotNull(applicationsTable.signupuserid)
		),
		limit: size,
		offset: (page - 1) * size,
		orderBy: desc(applicationsTable.reviewed),
		columns: {
			reviewed: true,
			signupuserid: true
		},
		with: {
			user: {
				columns: {
					username: true
				}
			}
		}
	})

	return { referrals, referralCount: referralCount.count }
}
