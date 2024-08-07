import { persistenceTable, placesTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { type RequestHandler, json, error } from '@sveltejs/kit'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'

const incrementSchema = z.object({
	placeId: z.coerce.number().int().positive(),
	key: z.string(), // name of the datastore
	type: z.enum(['standard', 'sorted']),
	scope: z.string(),
	target: z.string(), // key
	value: z.coerce.number().int()
})

export const POST: RequestHandler = async (event) => {
	const result = await incrementSchema.safeParseAsync({
		placeId: event.url.searchParams.get('placeId'),
		key: event.url.searchParams.get('key'),
		type: event.url.searchParams.get('type'),
		scope: event.url.searchParams.get('scope'),
		target: event.url.searchParams.get('target'),
		value: event.url.searchParams.get('value')
	})

	if (!result.success) {
		return error(400, { success: false, message: 'Invalid request.', data: {} })
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

	const dbValue = await db.query.persistenceTable.findFirst({
		where: and(
			eq(persistenceTable.placeid, result.data.placeId),
			eq(persistenceTable.scope, result.data.scope),
			eq(persistenceTable.target, result.data.target),
			eq(persistenceTable.key, result.data.key),
			eq(persistenceTable.type, result.data.type)
		),
		columns: {
			value: true
		}
	})

	let newValue

	if (dbValue) {
		newValue = (Number(dbValue?.value) + result.data.value).toString()

		if (isNaN(Number(newValue))) {
			return error(400, { success: false, message: 'Key is not a number.', data: {} })
		}

		await db
			.update(persistenceTable)
			.set({ value: newValue })
			.where(
				and(
					eq(persistenceTable.placeid, result.data.placeId),
					eq(persistenceTable.scope, result.data.scope),
					eq(persistenceTable.target, result.data.target),
					eq(persistenceTable.key, result.data.key)
				)
			)
	} else {
		await db.insert(persistenceTable).values({
			placeid: result.data.placeId,
			key: result.data.key,
			type: result.data.type,
			scope: result.data.scope,
			target: result.data.target,
			value: result.data.value.toString()
		})
	}

	const newData = {
		Value: dbValue ? newValue : result.data.value,
		Scope: result.data.scope,
		Key: result.data.key,
		Target: result.data.target
	}

	return json({ data: [newData] })
}
