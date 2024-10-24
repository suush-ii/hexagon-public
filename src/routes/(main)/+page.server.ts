import type { PageServerLoad, Actions } from './$types'
import { setError, message, superValidate } from 'sveltekit-superforms/server'
import { formSchema, applicationFormSchema } from '$lib/schemas/signupschema'
import { fail, redirect } from '@sveltejs/kit'
import { db } from '$src/lib/server/db'
import { auth } from '$src/lib/server/lucia'
import postgres from 'postgres' // TODO: Check this out later seems to be a workaround for a postgres issue https://github.com/porsager/postgres/issues/684 10/3/2023
import { usersTable, keyTable, applicationsTable } from '$lib/server/schema'
import { eq, or, sql, count } from 'drizzle-orm'
import { zod } from 'sveltekit-superforms/adapters'
import { LuciaError } from 'lucia'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import verificationWords from '$lib/server/verificationwords'
import { z } from 'zod'
import { filter } from './admin/users/applications/queue'

const uuid = z.string().uuid()

const limiter = new RateLimiter({
	IP: [1, '45s']
})

function getRandomWords(count: number): string {
	const shuffled = verificationWords.sort(() => 0.5 - Math.random())
	return shuffled.slice(0, count).join(' ')
}

export const load: PageServerLoad = async (event) => {
	const config = event.locals.config

	const session = await event.locals.auth.validate()
	if (session) redirect(302, '/home')

	const applicationResult = await uuid.safeParseAsync(event.url.searchParams.get('application'))

	let accepted = false
	let applicationid

	if (applicationResult.success) {
		const application = await db.query.applicationsTable.findFirst({
			where: eq(applicationsTable.applicationid, applicationResult.data),
			columns: { accepted: true, used: true, applicationid: true }
		})

		if (application?.accepted === true && !application?.used) {
			accepted = true
			applicationid = application.applicationid
		}
	}

	return {
		form: await superValidate(zod(formSchema)),
		applicationForm: await superValidate(zod(applicationFormSchema)),
		clicker: config?.[0]?.pageClicker ?? 0,
		registration: config?.[0]?.registrationEnabled ?? true,
		keysEnabled: config?.[0]?.keysEnabled,
		applicationsEnabled: config?.[0]?.applicationsEnabled,
		verificationPhrase: 'hexagon ' + getRandomWords(6),
		accepted,
		applicationid
	}
}

export const actions: Actions = {
	register: async (event) => {
		const form = await superValidate(event, zod(formSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { username, password, gender, key, application: applicationId } = form.data

		const config = event.locals.config

		if (config?.[0]?.registrationEnabled === false) {
			return message(form, 'Registration disabled.')
		}

		const keyDb = await db
			.select({ useable: keyTable.useable })
			.from(keyTable)
			.where(eq(keyTable.key, key ?? ''))
			.limit(1)

		if (config?.[0]?.keysEnabled === true && config?.[0]?.applicationsEnabled === false) {
			if (keyDb.length < 1) {
				return setError(form, 'key', 'Invalid key!')
			}

			if (keyDb?.[0].useable === false) {
				return setError(form, 'key', 'Key already used!')
			}
		}

		let application

		if (config?.[0]?.applicationsEnabled === true) {
			const applicationResult = await uuid.safeParseAsync(applicationId)

			if (applicationResult.success) {
				application = await db.query.applicationsTable.findFirst({
					where: eq(applicationsTable.applicationid, applicationResult.data),
					columns: { accepted: true, discordid: true, applicationid: true, used: true }
				})

				if (!application?.accepted || application?.used) {
					return message(form, 'Invalid application!')
				}
			}

			if (!application) {
				return message(form, 'Invalid application!')
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
					.where(eq(keyTable.key, key ?? ''))
			}

			if (config?.[0]?.applicationsEnabled === true && application) {
				await db
					.update(applicationsTable)
					.set({ used: true, signupuserid: session.user.userid })
					.where(eq(applicationsTable.applicationid, application.applicationid))

				await db
					.update(usersTable)
					.set({ discordid: application.discordid })
					.where(eq(usersTable.userid, session.user.userid))
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
	},
	application: async (event) => {
		const form = await superValidate(event, zod(applicationFormSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const config = event.locals.config

		if (config?.[0]?.registrationEnabled === false) {
			return message(form, 'Registration disabled.')
		}

		const [applicationsCount] = await db
			.select({ count: count() })
			.from(applicationsTable)
			.where(filter)

		if (applicationsCount.count >= 15) {
			return message(form, 'There are too many applications right now. Try again later.')
		}

		if (await limiter.isLimited(event)) {
			return message(form, 'Your submitting too fast!')
		}

		const currentApplication = await db.query.applicationsTable.findFirst({
			where: eq(applicationsTable.registerip, event.getClientAddress()),
			columns: { accepted: true }
		})

		if (currentApplication) {
			return message(form, 'You already submitted an application!')
		}

		const signedUp = await db.query.usersTable.findFirst({
			where: or(
				eq(usersTable.registerip, event.getClientAddress()),
				eq(usersTable.lastip, event.getClientAddress())
			),
			columns: { userid: true }
		})

		if (signedUp) {
			return message(form, 'Your ineligible to apply.')
		}

		const formattedData = Object.entries(form.data).map(([key, value]) => ({
			question: key,
			answer: value
		}))

		const [application] = await db
			.insert(applicationsTable)
			.values({
				questions: formattedData,
				verificationsequence: form.data.verificationPhrase,
				registerip: event.getClientAddress()
			})
			.returning({ applicationid: applicationsTable.applicationid })

		return redirect(302, `/applications/${application.applicationid}`)
	}
}
