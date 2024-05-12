import { error, fail, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { usersTable, bansTable, adminLogsTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { z } from 'zod'
import { count, eq, desc } from 'drizzle-orm'
import { superValidate } from 'sveltekit-superforms'
import { message } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { moderationSchema } from './schema'
import { getPageNumber } from '$src/lib/utils'

const permissionLevels = [
	{ name: 'owner', level: 1 },
	{ name: 'admin', level: 2 },
	{ name: 'mod', level: 3 },
	{ name: 'uploader', level: 4 },
	{ name: 'normal', level: 5 }
]

export const load: PageServerLoad = async ({ url }) => {
	if (!url.searchParams.get('id')) {
		redirect(302, '/admin/users/find?redirect=moderateuser')
	}

	const result = await z.number().safeParseAsync(Number(url.searchParams.get('id')))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	let page = getPageNumber(url)

	let size = 5

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
			joindate: true
		},
		with: {
			bans: {
				columns: {
					action: true,
					banid: true,
					time: true,
					expiration: true,
					internalreason: true
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

	if (user) {
		return {
			username: user.username,
			userid: user.userid,
			lastactivetime: user.lastactivetime,
			joindate: user.joindate,
			form: await superValidate(zod(moderationSchema)),
			punishments: user.bans,
			punishmentsCount: punishmentsCount[0].count
		}
	}

	error(404, { success: false, message: 'User not found!' })
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(moderationSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		if (form.data.action === 'None') {
			return { form }
		}

		if (!event.url.searchParams.get('id')) {
			redirect(302, '/admin/users/find?redirect=moderateuser')
		}

		const result = await z.number().safeParseAsync(Number(event.url.searchParams.get('id')))

		if (result.success === false) {
			error(400, { success: false, message: 'Malformed input.' })
		}

		const user = await db
			.select({
				role: usersTable.role
			})
			.from(usersTable)
			.where(eq(usersTable.userid, result.data))
			.limit(1)

		if (user.length === 0) {
			error(404, { success: false, message: 'User not found!' })
		}

		const recipientPermissionLevel =
			permissionLevels.find((level) => level.name === user[0].role)?.level ?? 0

		const currentPermissionLevel =
			permissionLevels.find((level) => level.name === event.locals.user.role)?.level ?? 0

		if (currentPermissionLevel > recipientPermissionLevel) {
			return fail(403, {
				success: false,
				message: 'You do not have permission to moderate this user.'
			})
		}

		const expiration = new Date()

		if (form.data.action === 'Ban 1 Day') {
			expiration.setDate(expiration.getDate() + 1)
		} else if (form.data.action === 'Ban 7 Days') {
			expiration.setDate(expiration.getDate() + 7)
		} else if (form.data.action === 'Ban 14 Days') {
			expiration.setDate(expiration.getDate() + 14)
		}

		const [ban] = await db
			.insert(bansTable)
			.values({
				action: form.data.action,
				userid: result.data,
				reason: form.data.note,
				internalreason: form.data.internalnote,
				expiration: expiration,
				moderatorid: event.locals.user.userid
			})
			.returning({ banid: bansTable.banid })

		if (
			form.data.action === 'Ban 1 Day' ||
			form.data.action === 'Ban 7 Days' ||
			form.data.action === 'Ban 14 Days'
		) {
			await db.insert(adminLogsTable).values({
				userid: event.locals.user.userid,
				associatedid: result.data,
				associatedidtype: 'user',
				action: 'ban',
				banlength: form.data.action
			})
		}

		if (form.data.action === 'Delete' || form.data.action === 'Poison') {
			await db.insert(adminLogsTable).values({
				userid: event.locals.user.userid,
				associatedid: result.data,
				associatedidtype: 'user',
				action: 'terminate'
			})
		}

		await db.update(usersTable).set({ banid: ban.banid }).where(eq(usersTable.userid, result.data))

		return {
			form
		}
	}
}
