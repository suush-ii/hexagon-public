import type { PageServerLoad, Actions } from './$types.js'
import { superValidate } from 'sveltekit-superforms'
import { formSchema } from './schema'
import { zod } from 'sveltekit-superforms/adapters'
import { fail } from '@sveltejs/kit'
import { setSitealert } from '$lib/server/config'

export const load: PageServerLoad = async ({ locals }) => {
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

		setSitealert(form.data.sitealert)

		return {
			form
		}
	}
}
