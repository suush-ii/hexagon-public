import { persistenceTable, placesTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { type RequestHandler, json, error } from '@sveltejs/kit'
import { z } from 'zod'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { eq } from 'drizzle-orm'

const setSchema = z.object({
	placeId: z.coerce.number().int().positive(),
	key: z.string(), // name of the datastore
	type: z.enum(['standard', 'sorted']),
	scope: z.string(),
	target: z.string() // key
})

const formData = z.object({
	value: z.string() // key value
})

export const POST: RequestHandler = async (event) => {
	const form = await superValidate(event, zod(formData))

	if (!form.valid) {
		return error(400, { success: false, message: 'Invalid request.', data: {} })
	}

	const result = await setSchema.safeParseAsync({
		placeId: event.url.searchParams.get('placeId'),
		key: event.url.searchParams.get('key'),
		type: event.url.searchParams.get('type'),
		scope: event.url.searchParams.get('scope'),
		target: event.url.searchParams.get('target')
	})

	if (!result.success) {
		return error(400, { success: false, message: 'Invalid request.', data: {} })
	}

	if (result.data.type === 'sorted' && isNaN(parseInt(form.data.value))) {
		// sorted values have to be integers
		return error(400, { success: false, message: 'Value not an int.', data: {} })
	}

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, result.data.placeId),
		columns: {},
		with: {
			associatedgame: {
				with: {
					author: {
						columns: {
							userid: true
						}
					}
				}
			}
		}
	})

	if (!place) {
		return error(404, { success: false, message: 'Place not found.', data: {} })
	}

	await db
		.insert(persistenceTable)
		.values({
			placeid: result.data.placeId,
			key: result.data.key,
			type: result.data.type,
			scope: result.data.scope,
			target: result.data.target,
			value: form.data.value
		})
		.onConflictDoUpdate({
			target: [persistenceTable.target, persistenceTable.placeid, persistenceTable.scope],
			set: { value: form.data.value }
		})

	const newData = {
		Value: form.data.value,
		Scope: result.data.scope,
		Key: result.data.key,
		Target: result.data.target
	}

	return json({ data: [newData] })
}
