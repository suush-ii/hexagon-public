import { error, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { bansTable, usersTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'

const actionMessages = {
	'Ban 1 Day': 'Banned for 1 Day',
	'Ban 3 Days': 'Banned for 3 Days',
	'Ban 7 Days': 'Banned for 7 Days',
	'Ban 14 Days': 'Banned for 14 Days',
	Delete: 'Account Deleted',
	Poison: 'Account Deleted',
	Warn: 'Warning',
	None: ''
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user.banid) {
		redirect(302, '/home')
	}

	const [ban] = await db
		.select({
			action: bansTable.action,
			note: bansTable.reason,
			time: bansTable.time,
			expiration: bansTable.expiration,
			offensivetext: bansTable.offensivecontent
		})
		.from(bansTable)
		.where(eq(bansTable.banid, locals.user.banid))
		.limit(1)

	const friendlyMessage = actionMessages[ban.action]

	const currentTime = new Date()

	return {
		ban: {
			action: friendlyMessage,
			note: ban.note,
			time: ban.time,
			offensivetext: ban.offensivetext
		},
		expired: new Date(ban.expiration) < currentTime
	}
}

export const actions: Actions = {
	default: async ({ locals }) => {
		if (!locals.user.banid) {
			redirect(302, '/home')
		}

		const [ban] = await db
			.select({
				action: bansTable.action,
				note: bansTable.reason,
				time: bansTable.time,
				expiration: bansTable.expiration
			})
			.from(bansTable)
			.where(eq(bansTable.banid, locals.user.banid))
			.limit(1)

		const currentTime = new Date()

		if (
			new Date(ban.expiration) < currentTime &&
			ban.action !== 'Delete' &&
			ban.action !== 'Poison'
		) {
			await db
				.update(usersTable)
				.set({ banid: null })
				.where(eq(usersTable.userid, locals.user.userid))
		} else {
			error(400, { success: false, message: 'Ban is not expired.' })
		}

		return redirect(302, '/home')
	}
}
