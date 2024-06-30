import type { PageServerLoad } from './$types'
import { getPageNumber } from '$lib/utils'
import { db } from '$lib/server/db'
import { count, asc, ilike } from 'drizzle-orm'
import { usersTable } from '$lib/server/schema'

export const load: PageServerLoad = async ({ url }) => {
	let search = url.searchParams.get('search') ?? ''

	let page = getPageNumber(url)

	let size = 10

	const [usersCount] = await db
		.select({ count: count() })
		.from(usersTable)
		.where(ilike(usersTable.username, `%${search}%`))
		.limit(1)

	if (usersCount.count < (page - 1) * size) {
		page = 1
	}

	const users = await db.query.usersTable.findMany({
		columns: {
			userid: true,
			username: true,
			lastactivetime: true,
			blurb: true
		},
		orderBy: asc(usersTable.userid),
		limit: size,
		offset: (page - 1) * size,
		where: ilike(usersTable.username, `%${search}%`)
	})

	return {
		users,
		usersCount: usersCount.count
	}
}
