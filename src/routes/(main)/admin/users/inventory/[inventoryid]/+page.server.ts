import type { PageServerLoad } from './$types'
import { error, redirect, type Actions } from '@sveltejs/kit'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { adminLogsTable, inventoryTable, usersTable } from '$src/lib/server/schema'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { moveSchema } from './schema'
import { zod } from 'sveltekit-superforms/adapters'

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const result = await z.number().safeParseAsync(Number(params.inventoryid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const item = await db.query.inventoryTable.findFirst({
		where: eq(inventoryTable.inventoryid, result.data),
		columns: { obatineddate: true },
		with: {
			asset: {
				columns: {
					moderationstate: true,
					assetname: true,
					assetid: true,
					created: true,
					assetType: true,
					creatoruserid: true
				}
			},
			owner: {
				columns: {
					username: true,
					userid: true
				}
			}
		}
	})

	if (!item) {
		error(404, { success: false, message: 'Inventory item not found.' })
	}

	return {
		moveForm: await superValidate(zod(moveSchema)),
		item
	}
}

export const actions: Actions = {
	move: async (event) => {
		const form = await superValidate(event, zod(moveSchema))
		const { params, locals } = event

		if (!form.valid || !params.inventoryid) {
			return fail(400, {
				form
			})
		}

		const { userId } = form.data

		const item = await db.query.inventoryTable.findFirst({
			where: eq(inventoryTable.inventoryid, Number(params.inventoryid)),
			columns: {},
			with: {
				owner: {
					columns: {
						userid: true
					}
				},
				asset: {
					columns: {
						assetid: true
					}
				}
			}
		})

		if (!item) {
			return fail(404, {
				form
			})
		}

		if (item.owner.userid == userId) {
			return setError(form, 'userId', 'You cannot move an item to the same user.')
		}

		await db
			.update(inventoryTable)
			.set({
				userid: userId
			})
			.where(eq(inventoryTable.inventoryid, Number(params.inventoryid)))

		await db.insert(adminLogsTable).values({
			userid: locals.user.userid,
			associatedid: item.owner.userid,
			associatedidtype: 'move',
			action: 'moveitem',
			moveditem: item.asset.assetid,
			movedinventoryitem: Number(params.inventoryid),
			movedto: userId
		})

		return {
			form
		}
	},
	delete: async (event) => {
		const { params, locals } = event

		const item = await db.query.inventoryTable.findFirst({
			where: eq(inventoryTable.inventoryid, Number(params.inventoryid)),
			columns: {},
			with: {
				owner: {
					columns: {
						userid: true
					}
				},
				asset: {
					columns: {
						assetid: true
					}
				}
			}
		})

		if (!item) {
			return error(404, { success: false, message: 'Inventory item not found.' })
		}

		await db
			.delete(inventoryTable)
			.where(eq(inventoryTable.inventoryid, Number(params.inventoryid)))

		await db.insert(adminLogsTable).values({
			userid: locals.user.userid,
			associatedid: item.owner.userid,
			associatedidtype: 'user',
			action: 'deleteitem',
			deleteditem: item.asset.assetid
		})

		return redirect(302, `/users/${item.owner.userid}/profile`)
	}
}
