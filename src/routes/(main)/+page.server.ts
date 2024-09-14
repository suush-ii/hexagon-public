import type { PageServerLoad, Actions } from './$types'
import { setError, message, superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$lib/schemas/signupschema'
import { fail, redirect } from '@sveltejs/kit'
import { db } from '$src/lib/server/db'
import { auth } from '$src/lib/server/lucia'
import postgres from 'postgres' // TODO: Check this out later seems to be a workaround for a postgres issue https://github.com/porsager/postgres/issues/684 10/3/2023
import { usersTable, keyTable } from '$lib/server/schema'
import { eq, or, sql } from 'drizzle-orm'
import { zod } from 'sveltekit-superforms/adapters'
import { LuciaError } from 'lucia'

export const load: PageServerLoad = async (event) => {
	const config = event.locals.config

	const session = await event.locals.auth.validate()
	if (session) redirect(302, '/home')

	return {
		form: await superValidate(zod(formSchema)),
		clicker: config?.[0]?.pageClicker ?? 0,
		registration: config?.[0]?.registrationEnabled ?? true,
		keysEnabled: config?.[0]?.keysEnabled
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

		const keyDb = await db
			.select({ useable: keyTable.useable })
			.from(keyTable)
			.where(eq(keyTable.key, key))
			.limit(1)

		if (config?.[0]?.keysEnabled === true) {
			if (keyDb.length < 1) {
				return setError(form, 'key', 'Invalid key!')
			}

			if (keyDb?.[0].useable === false) {
				return setError(form, 'key', 'Key already used!')
			}
		}

		const user = await db
			.select({
				username: usersTable.username
			})
			.from(usersTable)
			.where(
				or(
					eq(usersTable.username, username),
					eq(sql`lower(${usersTable.scrubbedusername})`, sql`lower(${username})`)
				)
			)
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
					coins: 10,
					role: 'normal',
					gender: gender,
					registerip: event.getClientAddress()
				}
			})

			const session = await auth.createSession({
				userId: nUser.userId,
				attributes: {}
			})
			event.locals.auth.setSession(session) // set session cookie

			if (config?.[0]?.keysEnabled === true) {
				await db
					.update(keyTable)
					.set({
						claimedby: session.user.userid,
						useable: false
					})
					.where(eq(keyTable.key, key))
			}
		} catch (e) {
			//console.log(e)
			if (
				(e instanceof postgres.PostgresError && e.code === '23505') ||
				(e instanceof LuciaError && e.message === 'AUTH_DUPLICATE_KEY_ID')
			) {
				return setError(form, 'username', 'Username taken!')
			}

			return fail(400, { form }) // wtf happened!!
		}

		redirect(301, '/home')
	}
}
