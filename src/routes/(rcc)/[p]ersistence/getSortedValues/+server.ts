import { persistenceTable, placesTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { type RequestHandler, error, json } from '@sveltejs/kit'
import { z } from 'zod'
import { and, asc, count, desc, eq, sql } from 'drizzle-orm'

const setSchema = z.object({
	placeId: z.coerce.number().int().positive(),
	type: z.enum(['standard', 'sorted']),
	scope: z.string(),
	key: z.string(), // name of the datastore
	pageSize: z.coerce.number().int().min(1).max(100),
	ascending: z.enum(['False', 'True']),
	exclusiveStartKey: z.coerce.number().int().optional(),
	inclusiveMinValue: z.coerce.number().int().optional(),
	inclusiveMaxValue: z.coerce.number().int().optional()
})

export const POST: RequestHandler = async (event) => {
	const result = await setSchema.safeParseAsync({
		placeId: event.url.searchParams.get('placeId'),
		type: event.url.searchParams.get('type'),
		scope: event.url.searchParams.get('scope'),
		key: event.url.searchParams.get('key'),
		pageSize: event.url.searchParams.get('pageSize'),
		ascending: event.url.searchParams.get('ascending'),
		exclusiveStartKey: event.url.searchParams.get('exclusiveStartKey'),
		inclusiveMinValue: event.url.searchParams.get('inclusiveMinValue'),
		inclusiveMaxValue: event.url.searchParams.get('inclusiveMaxValue')
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

	if (!result.data.exclusiveStartKey || result.data.exclusiveStartKey < 1) {
		result.data.exclusiveStartKey = 1
	}

	if (result.data.inclusiveMinValue && result.data.inclusiveMinValue < 0) {
		result.data.inclusiveMinValue = 0
	}

	if (result.data.inclusiveMaxValue && result.data.inclusiveMaxValue < 0) {
		result.data.inclusiveMaxValue = 0
	}

	const commonWhere = and(
		eq(persistenceTable.placeid, result.data.placeId),
		eq(persistenceTable.scope, result.data.scope),
		eq(persistenceTable.key, result.data.key),
		eq(persistenceTable.type, result.data.type)
	)

	const inclusiveMinValue = and(
		commonWhere,
		sql`cast("value" as bigint) >= ${result.data.inclusiveMinValue}`
	)

	const inclusiveMaxValue = and(
		commonWhere,
		sql`cast("value" as bigint) < ${result.data.inclusiveMaxValue}`
	)

	const both = and(inclusiveMinValue, inclusiveMaxValue)

	let whereCondition = commonWhere

	if (result.data.inclusiveMinValue) {
		whereCondition = inclusiveMinValue
	}

	if (result.data.inclusiveMaxValue) {
		whereCondition = inclusiveMaxValue
	}

	if (result.data.inclusiveMinValue && result.data.inclusiveMaxValue) {
		whereCondition = both
	}

	const [dataCount] = await db
		.select({ count: count() })
		.from(persistenceTable)
		.where(whereCondition)
		.limit(1)

	if (dataCount.count < (result.data.exclusiveStartKey - 1) * result.data.pageSize) {
		result.data.exclusiveStartKey = 1
	}

	const data = await db.query.persistenceTable.findMany({
		where: whereCondition,
		columns: {
			value: true,
			scope: true,
			key: true,
			target: true
		},
		orderBy:
			result.data.ascending === 'True' ? asc(persistenceTable.value) : desc(persistenceTable.value),
		limit: result.data.pageSize,
		offset: (result.data.exclusiveStartKey - 1) * result.data.pageSize
	})

	if (data.length === 0) {
		return json({ data: { Entries: [], ExclusiveStartKey: null } }) // no data
	}

	const newData = data.map((item) => ({
		Value: item.value,
		Target: item.target
	}))

	return json({
		data: { Entries: newData, ExclusiveStartKey: (result.data.exclusiveStartKey + 1).toString() }
	}) // next page as exclusive start key
}
