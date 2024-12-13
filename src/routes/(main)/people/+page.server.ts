import type { PageServerLoad } from './$types'
import { getPageNumber } from '$lib/utils'
import { db } from '$lib/server/db'
import { count, desc, ilike } from 'drizzle-orm'
import { usersTable } from '$lib/server/schema'
import { getUserState } from '$lib/server/userState'

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search') ?? ''

	let page = getPageNumber(url)

	const size = 10

	const [usersCount] = await db
		.select({ count: count() })
		.from(usersTable)
		.where(ilike(usersTable.username, `%${search}%`))
		.limit(1)

	if (usersCount.count < (page - 1) * size) {
		page = 1
	}

	const user = await db.query.usersTable.findMany({
		columns: {
			userid: true,
			username: true,
			lastactivetime: true,
			blurb: true,
			activegame: true,
			studiopresencelocation: true,
			studiopresenceping: true,
			gamepresenceping: true
		},
		orderBy: desc(usersTable.lastactivetime),
		limit: size,
		offset: (page - 1) * size,
		where: ilike(usersTable.username, `%${search}%`)
	})

	const users = user?.map((user) => {
		const status = getUserState(
			user.lastactivetime,
			user.activegame,
			user.studiopresencelocation,
			user.studiopresenceping,
			user.gamepresenceping
		)
		return { ...user, status }
	})

	return {
		users,
		usersCount: usersCount.count
	}
}
