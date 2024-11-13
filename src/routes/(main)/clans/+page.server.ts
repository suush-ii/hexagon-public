import { db } from '$lib/server/db'
import { eq, and } from 'drizzle-orm'
import type { Actions, PageServerLoad } from './$types'
import { assetTable, clanItemsTable, inventoryTable, usersTable } from '$lib/server/schema'
import { fail, message, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { formSchema } from './clans'

const limiter = new RateLimiter({
	IP: [2, '5s']
})

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, locals.user.userid),
		columns: {
			registeredclan: true
		}
	})

	return {
		clan: user?.registeredclan,
		form: await superValidate(zod(formSchema)),
		clanUrl: url.searchParams.get('clan')
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

		if (await limiter.isLimited(event)) {
			return message(form, 'Your submitting too fast!')
		}

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.userid, event.locals.user.userid),
			columns: {
				registeredclan: true
			}
		})

		if (user?.registeredclan === form.data.clan) {
			await db
				.update(usersTable)
				.set({ registeredclan: null })
				.where(eq(usersTable.userid, event.locals.user.userid))
		} else {
			await db.transaction(async (tx) => {
				await tx
					.update(usersTable)
					.set({ registeredclan: form.data.clan })
					.where(eq(usersTable.userid, event.locals.user.userid))

				const item = await tx.query.clanItemsTable.findFirst({
					columns: {
						awardid: true
					},
					where: eq(clanItemsTable.clan, form.data.clan)
				})

				if (item) {
					const itemId = await tx.query.assetTable.findFirst({
						columns: {
							assetType: true
						},
						where: eq(assetTable.assetid, item.awardid)
					})

					if (itemId) {
						const owned = await tx.query.inventoryTable.findFirst({
							columns: {
								itemid: true
							},

							where: and(
								eq(inventoryTable.userid, event.locals.user.userid),
								eq(inventoryTable.itemid, item.awardid)
							)
						})

						if (!owned) {
							await tx.insert(inventoryTable).values({
								userid: event.locals.user.userid,
								itemid: item.awardid,
								itemtype: itemId.assetType,
								wearing: false
							})
						}
					}
				}
			})
		}

		return { form }
	}
}
