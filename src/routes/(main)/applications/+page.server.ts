import { fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$src/lib/schemas/applicationschema'
import { zod } from 'sveltekit-superforms/adapters'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { applicationsTable } from '$src/lib/server/schema'

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

		const application = await db.query.applicationsTable.findFirst({
			where: eq(applicationsTable.applicationid, applicationid)
		})

		if (!application) {
			return message(form, 'Invalid Application ID.')
		}

		return redirect(302, `/applications/${applicationid}`)
	}
}
