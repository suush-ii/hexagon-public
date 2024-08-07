import { persistenceTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { type RequestHandler, error, json } from '@sveltejs/kit'
import { z } from 'zod'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { and, eq } from 'drizzle-orm'

const setSchema = z.object({
	placeId: z.coerce.number().int().positive(),
	type: z.enum(['standard', 'sorted']),
	scope: z.string()
})

const formData = z.object({
	'qkeys[0].scope': z.string(),
	'qkeys[0].target': z.string(), // key
	'qkeys[0].key': z.string() // name of the datastore
})

export const POST: RequestHandler = async (event) => {
	const form = await superValidate(event, zod(formData))

	if (!form.valid) {
		return error(400, { success: false, message: 'Invalid request.', data: {} })
	}

	const result = await setSchema.safeParseAsync({
		placeId: event.url.searchParams.get('placeId'),
		type: event.url.searchParams.get('type'),
		scope: event.url.searchParams.get('scope')
	})

	if (!result.success) {
		return error(400, { success: false, message: 'Invalid request.', data: {} })
	}

	const data = await db.query.persistenceTable.findMany({
		where: and(
			eq(persistenceTable.placeid, result.data.placeId),
			eq(persistenceTable.scope, result.data.scope),
			eq(persistenceTable.target, form.data['qkeys[0].target']),
			eq(persistenceTable.key, form.data['qkeys[0].key']),
			eq(persistenceTable.type, result.data.type)
		),
		columns: {
			value: true,
			scope: true,
			key: true,
			target: true
		}
	})

	const newData = data.map((item) => ({
		Value: item.value,
		Scope: item.scope,
		Key: item.key,
		Target: item.target
	}))

	return json({ data: newData })
}
