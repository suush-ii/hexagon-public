import type { PageServerLoad, Actions } from './$types.js'
import { superValidate } from 'sveltekit-superforms'
import { formSchema } from './schema'
import { zod } from 'sveltekit-superforms/adapters'
import { fail } from '@sveltejs/kit'
import { set } from '$lib/server/config'
import { db } from '$lib/server/db.js'
import { eq } from 'drizzle-orm'
import { clanItemsTable } from '$lib/server/schema/assets.js'

export const load: PageServerLoad = async ({ locals }) => {
	const coneHat = await db.query.clanItemsTable.findFirst({
		columns: {
			awardid: true
		},
		where: eq(clanItemsTable.clan, 'cone')
	})

	const wuffHat = await db.query.clanItemsTable.findFirst({
		columns: {
			awardid: true
		},
		where: eq(clanItemsTable.clan, 'wuff')
	})

	const jamrioHat = await db.query.clanItemsTable.findFirst({
		columns: {
			awardid: true
		},
		where: eq(clanItemsTable.clan, 'jamrio')
	})

	return {
		form: await superValidate(zod(formSchema)),
		config: locals.config[0],
		coneHat,
		wuffHat,
		jamrioHat
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

		set(form.data)

		if (form.data.coneHat) {
			await db
				.insert(clanItemsTable)
				.values({
					awardid: form.data.coneHat,
					clan: 'cone'
				})
				.onConflictDoUpdate({
					target: clanItemsTable.clan,
					set: { awardid: form.data.coneHat }
				})
		} else {
			await db.delete(clanItemsTable).where(eq(clanItemsTable.clan, 'cone'))
		}

		if (form.data.wuffHat) {
			await db
				.insert(clanItemsTable)
				.values({
					awardid: form.data.wuffHat,
					clan: 'wuff'
				})
				.onConflictDoUpdate({
					target: clanItemsTable.clan,
					set: { awardid: form.data.wuffHat }
				})
		} else {
			await db.delete(clanItemsTable).where(eq(clanItemsTable.clan, 'wuff'))
		}

		if (form.data.jamrioHat) {
			await db
				.insert(clanItemsTable)
				.values({
					awardid: form.data.jamrioHat,
					clan: 'jamrio'
				})
				.onConflictDoUpdate({
					target: clanItemsTable.clan,
					set: { awardid: form.data.jamrioHat }
				})
		} else {
			await db.delete(clanItemsTable).where(eq(clanItemsTable.clan, 'jamrio'))
		}

		return {
			form
		}
	}
}
