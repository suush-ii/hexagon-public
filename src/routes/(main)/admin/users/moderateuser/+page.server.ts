import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { usersTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

export const load: PageServerLoad = async ({ url }) => {
	if (!url.searchParams.get('id')) {
		redirect(302, '/admin/users/find?redirect=moderateuser')
	}

	const result = await z.number().safeParseAsync(Number(url.searchParams.get('id')))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const user = await db
		.select({
			username: usersTable.username,
			userid: usersTable.userid,
			lastactivetime: usersTable.lastactivetime,
			joindate: usersTable.joindate
		})
		.from(usersTable)
		.where(eq(usersTable.userid, result.data))
		.limit(1)

	if (user.length != 0) {
		return {
			username: user[0].username,
			userid: user[0].userid,
			lastactivetime: user[0].lastactivetime,
			joindate: user[0].joindate
		}
	}

	error(404, { success: false, message: 'User not found!' })
}
