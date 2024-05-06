import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './/$types'
import { filter as queueFilter } from './catalog/queue/index'
import { db } from '$lib/server/db'
import { count } from 'drizzle-orm'
import { assetTable } from '$src/lib/server/schema'

export const load: LayoutServerLoad = async ({ url, locals }) => {
	const queueCount = await db
		.select({ count: count() })
		.from(assetTable)
		.where(queueFilter)
		.limit(1)

	return {
		queueCount: queueCount[0].count
	}
}
