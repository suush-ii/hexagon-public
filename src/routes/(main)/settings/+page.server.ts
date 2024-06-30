import type { PageServerLoad, Actions } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$lib/schemas/settingsschema'
import { zod } from 'sveltekit-superforms/adapters'
import { fail } from 'sveltekit-superforms'
import { db } from '$lib/server/db'
import { usersTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'

export const load: PageServerLoad = async ({ locals }) => {
	const blurb = await db
		.select({ blurb: usersTable.blurb })
		.from(usersTable)
		.where(eq(usersTable.userid, locals.user.userid))
		.limit(1)

	return {
		form: await superValidate(zod(formSchema)),
		blurb: blurb[0].blurb
	}
}

export const actions: Actions = {
	other: async (event) => {
		const form = await superValidate(event, zod(formSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { blurb } = form.data

		await db
			.update(usersTable)
			.set({ blurb })
			.where(eq(usersTable.userid, event.locals.user.userid))
	}
}
