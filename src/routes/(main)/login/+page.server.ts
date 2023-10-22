import { fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$src/lib/schemas/loginschema'
import { auth } from '$src/lib/server/lucia'
import { LuciaError } from 'lucia'

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth.validate()
	if (session) throw redirect(302, '/home')

	return {
		form: superValidate(formSchema)
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, formSchema)
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
			event.locals.auth.setSession(session) // set session cookie
		} catch (e) {
			if (
				e instanceof LuciaError &&
				(e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
			) {
				return message(form, 'Invalid Username/Password.')
			}

			return message(form, 'Unknown error!') // wtf happened!!
		}

		throw redirect(302, '/home') // success!
	}
}
