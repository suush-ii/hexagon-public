import type { PageServerLoad, Actions } from './$types'
import { setError, message, superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$lib/schemas/signupschema'
import { fail, redirect } from '@sveltejs/kit'
import { db } from '$src/lib/server/db'
import { auth } from '$src/lib/server/lucia'
import postgres from 'postgres' // TODO: Check this out later seems to be a workaround for a postgres issue https://github.com/porsager/postgres/issues/684 10/3/2023
import { usersTable } from '$src/lib/server/schema/users'
import { eq } from 'drizzle-orm'
import { zod } from 'sveltekit-superforms/adapters'

export const load: PageServerLoad = async (event) => {
	const config = event.locals.config

	const session = await event.locals.auth.validate()
	if (session) redirect(302, '/home')

	return {
		form: await superValidate(zod(formSchema)),
		clicker: config?.[0]?.pageClicker ?? 0,
		registration: config?.[0]?.registrationEnabled ?? true
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}
		const { username, password, gender, key } = form.data

		const config = event.locals.config

		if (config?.[0]?.registrationEnabled === false) {
			return message(form, 'Registration disabled.')
		}

		const user = await db
			.select({
				username: usersTable.username
			})
			.from(usersTable)
			.where(eq(usersTable.username, username))
			.limit(1)

		if (user.length != 0) {
			return setError(form, 'username', 'Username taken!')
		}

		try {
			const nUser = await auth.createUser({
				key: {
					providerId: 'username',
					providerUserId: username.toLowerCase(),
					password: password
				},
				attributes: {
					username: username,
					coins: 0,
					joindate: new Date(),
					role: 'normal',
					gender: gender
				}
			})

			const session = await auth.createSession({
				userId: nUser.userId,
				attributes: {}
			})
			event.locals.auth.setSession(session) // set session cookie
		} catch (e) {
			//console.log(e)
			if (e instanceof postgres.PostgresError && e.code === '23505') {
				return setError(form, 'username', 'Username taken!')
			}

			return fail(400, form) // wtf happened!!
		}

		redirect(301, '/home')
	}
}
