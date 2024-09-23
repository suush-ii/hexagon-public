import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { usersTable, bansTable, applicationsTable } from '$lib/server/schema'
import { count, eq, desc } from 'drizzle-orm'
import { getPageNumber } from '$lib/utils'

export const load: PageServerLoad = async ({ url }) => {
	if (!url.searchParams.get('id')) {
		redirect(302, '/admin/users/find?redirect=useradmin')
	}

	const result = await z.number().safeParseAsync(Number(url.searchParams.get('id')))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	let page = getPageNumber(url)

	const size = 5

	const punishmentsCount = await db
		.select({ count: count() })
		.from(bansTable)
		.where(eq(bansTable.userid, result.data))
		.limit(1)

	if (punishmentsCount[0].count < (page - 1) * size) {
		page = 1
	}

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, result.data),
		columns: {
			username: true,
			userid: true,
			lastactivetime: true,
			joindate: true,
			discordid: true
		},
		with: {
			bans: {
				columns: {
					action: true,
					banid: true,
					time: true,
					expiration: true
				},
				with: {
					moderator: {
						columns: {
							username: true,
							userid: true
						}
					}
				},
				orderBy: desc(bansTable.time),
				limit: size,
				offset: (page - 1) * size
			}
		}
	})

	const application = await db.query.applicationsTable.findFirst({
		where: eq(applicationsTable.signupuserid, result.data),
		columns: {
			questions: true,
			internalreason: true
		}
	})

	if (user) {
		return {
			username: user.username,
			userid: user.userid,
			lastactivetime: user.lastactivetime,
			joindate: user.joindate,
			punishments: user.bans,
			punishmentsCount: punishmentsCount[0].count,
			banid: user.banid,
			discordid: user.discordid,
			application
		}
	}

	error(404, { success: false, message: 'User not found!' })
}
