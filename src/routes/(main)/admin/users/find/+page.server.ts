import type { PageServerLoad, Actions } from './$types.js'
import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { usernameSchema, idSchema, discordIdSchema } from './schema'
import { zod } from 'sveltekit-superforms/adapters'
import { db } from '$lib/server/db'
import { eq, ilike } from 'drizzle-orm'
import { usersTable } from '$lib/server/schema/users'

export const load: PageServerLoad = async ({ url }) => {
	const redirectString = url.searchParams.get('redirect')

	if (
		redirectString &&
		redirectString !== 'useradmin' &&
		redirectString !== 'moderateuser' &&
		redirectString !== 'tradehistory'
	) {
		redirect(302, url.pathname)
	}

	return {
		usernameForm: await superValidate(zod(usernameSchema)),
		idForm: await superValidate(zod(idSchema)),
		discordIdForm: await superValidate(zod(discordIdSchema))
	}
}

export const actions: Actions = {
	username: async (event) => {
		const form = await superValidate(event, zod(usernameSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}
		const { username } = form.data

		const users = await db
			.select({
				username: usersTable.username,
				userid: usersTable.userid,
				role: usersTable.role,
				joindate: usersTable.joindate
			})
			.from(usersTable)
			.limit(10)
			.where(ilike(usersTable.username, `%${username}%`))

		return {
			form,
			users
		}
	},

	id: async (event) => {
		const form = await superValidate(event, zod(idSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}
		const { userid } = form.data

		const users = await db
			.select({
				username: usersTable.username,
				userid: usersTable.userid,
				role: usersTable.role,
				joindate: usersTable.joindate
			})
			.from(usersTable)
			.limit(10)
			.where(eq(usersTable.userid, userid))

		return {
			form,
			users
		}
	},

	discordid: async (event) => {
		const form = await superValidate(event, zod(discordIdSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}
		const { discordid } = form.data

		const users = await db
			.select({
				username: usersTable.username,
				userid: usersTable.userid,
				role: usersTable.role,
				joindate: usersTable.joindate
			})
			.from(usersTable)
			.limit(10)
			.where(eq(usersTable.discordid, discordid.toString()))

		console.log(discordid.toString())

		return {
			form,
			users
		}
	}
}
