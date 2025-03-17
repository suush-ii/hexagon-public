import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema'
import { and, count, desc, isNotNull, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { commonWhere } from '$src/lib/server/catalog'

const catalogSchema = z.object({
	page: z.number().int().optional(),
	collectableFilter: z.boolean().optional(),
	search: z.string().optional()
})

export const POST: RequestHandler = async ({ request }) => {
	let requestJson

	try {
		requestJson = await request.json()
	} catch {
		return json({ success: false, message: 'Malformed JSON.', data: {} })
	}

	const result = await catalogSchema.safeParseAsync(requestJson)

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const size = 100

	let page = result.data.page || 1

	if (page < 1) {
		page = 1
	}

	const collectableFilter = result.data.collectableFilter
		? isNotNull(assetTable.limited)
		: undefined

	const search = result.data.search || ''

	const [itemscount] = await db
		.select({ count: count() })
		.from(assetTable)
		.where(and(commonWhere, collectableFilter, ilike(assetTable.assetname, `%${search}%`)))

	if (itemscount.count < (page - 1) * size) {
		page = 1
	}

	const nextPageCursor = page + 1 < itemscount.count / size ? page + 1 : null

	const items = await db.query.assetTable.findMany({
		where: and(commonWhere, collectableFilter, ilike(assetTable.assetname, `%${search}%`)), // library assets
		columns: {
			assetname: true,
			price: true,
			assetid: true,
			creatoruserid: true,
			updated: true,
			sales: true,
			favorites: true,
			limited: true,
			recentaverageprice: true
		},
		with: {
			author: {
				columns: {
					username: true
				}
			}
		},
		orderBy: desc(assetTable.updated),
		limit: size,
		offset: (page - 1) * size
	})

	return json({ success: true, data: { items }, nextPageCursor })
}
