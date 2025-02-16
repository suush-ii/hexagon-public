import { error, fail, isHttpError, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$src/lib/schemas/loginschema'
import { auth } from '$src/lib/server/lucia'
import { LuciaError } from 'lucia'
import { zod } from 'sveltekit-superforms/adapters'
import { db } from '$src/lib/server/db'
import { usersTable } from '$src/lib/server/schema'
import { eq } from 'drizzle-orm'
import { authenticator } from '@otplib/preset-default'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { formSchema as _2faSchema } from '$lib/schemas/2faschema'

const limiter = new RateLimiter({
	IP: [1, '2s']
})

const strictLimiter = new RateLimiter({
	IP: [25, '45m']
})

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth.validate()
	if (session) redirect(302, '/home')

	return {
		form: await superValidate(zod(formSchema)),
		_2faForm: await superValidate(zod(_2faSchema))
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
		const { username, password, _2facode } = form.data

		if ((await limiter.isLimited(event)) || (await strictLimiter.isLimited(event))) {
			return message(form, 'Your submitting too fast!')
		}

		try {
			const user = await auth.useKey(
				'username',
				username.toString().toLowerCase(),
				password.toString()
			)

			const userKey = await db.query.usersTable.findFirst({
				where: eq(usersTable.id, user.userId),
				columns: {
					_2fasecret: true
				}
			})

			if (userKey?._2fasecret) {
				if (!_2facode) {
					return error(401, { success: false, message: '2fa_required' })
				}

				if (!authenticator.check(_2facode.toString(), userKey._2fasecret)) {
					return message(form, 'Invalid 2FA Code.')
				}
			}

			const session = await auth.createSession({
				userId: user.userId,
				attributes: {}
			})
			const sessionCookie = auth.createSessionCookie(session)

			const path = sessionCookie.attributes.path || '/'

			sessionCookie.attributes.secure = false // allow on http

			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				...sessionCookie.attributes,
				path
			}) // set session cookie
		} catch (e) {
			if (
				e instanceof LuciaError &&
				(e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
			) {
				return message(form, 'Invalid Username/Password.')
			}

			if (isHttpError(e)) {
				return error(e.status, { success: false, message: e.body.message })
			}

			return message(form, 'Unknown error!') // wtf happened!!
		}

		if (event.url.searchParams.get('redirect')) {
			return redirect(302, event.url.searchParams.get('redirect')!)
		}

		redirect(302, '/home') // success!
	}
}
