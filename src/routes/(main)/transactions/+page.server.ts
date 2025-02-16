import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { count, desc, eq, and, or } from 'drizzle-orm'
import { transactionsTable } from '$lib/server/schema/users'
import { getPageNumber } from '$lib/utils'

export const load: PageServerLoad = async ({ url, locals }) => {
	let page = getPageNumber(url)

	const size = 30

	let category = url.searchParams.get('category') ?? 'purchase'

	if (category !== 'sales' && category !== 'purchase' && category !== 'stipend') {
		category = 'purchase'
	}

	const purchase = category === 'purchase'

	if (category === 'sales' || category === 'purchase' || category === 'stipend') {
		const transactionsCount = await db
			.select({ count: count() })
			.from(transactionsTable)
			.where(
				and(
					eq(transactionsTable.userid, locals.user.userid),
					purchase
						? or(eq(transactionsTable.type, category), eq(transactionsTable.type, 'purchasebid'))
						: eq(transactionsTable.type, category)
				)
			)
			.limit(1)

		if (transactionsCount[0].count < (page - 1) * size) {
			page = 1
		}

		const transactions = await db.query.transactionsTable.findMany({
			with: {
				member: {
					columns: {
						username: true
					}
				},
				item: {
					columns: {
						assetname: true
					}
				}
			},
			orderBy: desc(transactionsTable.time),
			limit: size,
			offset: (page - 1) * size,
			where: and(
				eq(transactionsTable.userid, locals.user.userid),
				purchase
					? or(eq(transactionsTable.type, category), eq(transactionsTable.type, 'purchasebid'))
					: eq(transactionsTable.type, category)
			)
		})

		return {
			transactions,
			transactionsCount: transactionsCount[0].count
		}
	}
}
