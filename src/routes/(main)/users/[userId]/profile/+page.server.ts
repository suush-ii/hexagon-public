import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db } from '$src/lib/server/db'
import { usersTable } from '$src/lib/server/schema/users'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { userState } from '$lib/types'
import { getUserState } from '$lib/server/userState'

export const load: PageServerLoad = async ({ params }) => {
	const result = await z.number().safeParseAsync(Number(params.userId))

	if (result.success === false) {
		throw error(400, { success: false, message: 'Malformed input.' })
	}

	const user = await db
		.select({
			username: usersTable.username,
			userid: usersTable.userid,
			lastactivetime: usersTable.lastactivetime,
			joindate: usersTable.joindate
		})
		.from(usersTable)
		.where(eq(usersTable.userid, Number(params.userId)))
		.limit(1)

	const status: userState = getUserState(user[0].lastactivetime)

	if (user.length != 0) {
		return {
			username: user[0].username,
			userid: user[0].userid,
			lastactivetime: user[0].lastactivetime,
			joindate: user[0].joindate,
			status
		}
	}

	throw error(404, { success: false, message: 'User not found!' })
}
