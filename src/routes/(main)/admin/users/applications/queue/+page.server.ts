import type { PageServerLoad, Actions } from './$types.js'
import { db } from '$lib/server/db'
import { and, count, eq, asc } from 'drizzle-orm'
import { applicationsTable } from '$lib/server/schema'
import { filter } from '.'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema } from '$lib/schemas/queueschema'
import { fail } from '@sveltejs/kit'

export const load: PageServerLoad = async () => {
	const [application] = await db
		.select()
		.from(applicationsTable)
		.limit(1)
		.where(filter)
		.orderBy(asc(applicationsTable.created)) // oldest first

	const applicationsCount = await db
		.select({ count: count() })
		.from(applicationsTable)
		.where(filter)

	const form = await superValidate(zod(formSchema))

	if (application) {
		form.data.applicationid = application.applicationid
	}

	return {
		application,
		applicationsCount: applicationsCount[0].count,
		form
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

		const { locals } = event

		const approved = form.data.approved

		const applicationid = form.data.applicationid

		const internalreason = form.data.internalreason

		const application = await db.query.applicationsTable.findFirst({
			where: and(eq(applicationsTable.applicationid, applicationid), filter)
		})

		if (!application) {
			return fail(404, {
				form
			})
		}

		await db
			.update(applicationsTable)
			.set({
				accepted: approved,
				revieweruserid: locals.user.userid,
				reviewed: new Date(),
				internalreason
			})
			.where(eq(applicationsTable.applicationid, applicationid))
	}
}
