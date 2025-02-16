import { fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$src/lib/schemas/applicationschema'
import { zod } from 'sveltekit-superforms/adapters'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { applicationsTable } from '$src/lib/server/schema'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
const limiter = new RateLimiter({
	IP: [1, '2s']
})

const strictLimiter = new RateLimiter({
	IP: [25, '45m']
})

export const load: PageServerLoad = async (event) => {
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
		const { applicationid } = form.data

		if ((await limiter.isLimited(event)) || (await strictLimiter.isLimited(event))) {
			return message(form, 'Your submitting too fast!')
		}

		const application = await db.query.applicationsTable.findFirst({
			where: eq(applicationsTable.applicationid, applicationid)
		})

		if (!application) {
			return message(form, 'Invalid Application ID.')
		}

		return redirect(302, `/applications/${applicationid}`)
	}
}
