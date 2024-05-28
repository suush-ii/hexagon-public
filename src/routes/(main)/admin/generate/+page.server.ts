import type { PageServerLoad, Actions } from './$types.js'
import { superValidate } from 'sveltekit-superforms'
import { formSchema, type FormSchema } from './schema'
import { zod } from 'sveltekit-superforms/adapters'
import { fail } from '@sveltejs/kit'
import { db } from '$lib/server/db.js'
import { keyTable } from '$lib/server/schema'

export const load: PageServerLoad = async ({ locals }) => {
	return {
		form: await superValidate(zod(formSchema)),
		config: locals.config[0]
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

		let keys = []

		for (let i = 0; i < form.data.amount; i++) {
			const expiration = new Date()

			expiration.setDate(expiration.getDate() + 365) // 1 year

			let [key] = await db
				.insert(keyTable)
				.values({
					key:
						'Hexagon-' +
						Math.random().toString(36).substring(2, 15) +
						Math.random().toString(36).substring(2, 15),
					madebyuserid: event.locals.user.userid,
					expires: expiration,
					useable: true
				})
				.returning({ key: keyTable.key })

			keys.push(key.key)
		}

		return {
			form,
			keys
		}
	}
}
