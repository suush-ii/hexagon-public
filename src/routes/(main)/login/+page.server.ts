import { fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$src/lib/schemas/loginschema'
import { auth } from '$src/lib/server/lucia'
import { LuciaError } from 'lucia'
import { zod } from 'sveltekit-superforms/adapters'

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth.validate()
	if (session) redirect(302, '/home')

	return {
		form: await superValidate(zod(formSchema))
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
		const { username, password } = form.data

		try {
			const user = await auth.useKey(
				'username',
				username.toString().toLowerCase(),
				password.toString()
			)
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

			return message(form, 'Unknown error!') // wtf happened!!
		}

		if (event.url.searchParams.get('redirect')) {
			return redirect(302, event.url.searchParams.get('redirect')!)
		}

		redirect(302, '/home') // success!
	}
}
