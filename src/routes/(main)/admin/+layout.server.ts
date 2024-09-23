import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './/$types'
import { filter as queueFilter } from './catalog/queue/index'
import { filter as applicationQueueFilter } from './users/applications/queue/index'
import { db } from '$lib/server/db'
import { count, eq } from 'drizzle-orm'
import { assetTable, applicationsTable } from '$src/lib/server/schema'

export const load: LayoutServerLoad = async ({ url, locals }) => {
	const queueCount = await db
		.select({ count: count() })
		.from(assetTable)
		.where(queueFilter)
		.limit(1)

	const applicationQueueCount = await db
		.select({ count: count() })
		.from(applicationsTable)
		.where(applicationQueueFilter)
		.limit(1)

	const userQueueCount = await db
		.select({ count: count() })
		.from(assetTable)
		.where(eq(assetTable.topunish, true))
		.limit(1)

	return {
		queueCount: queueCount[0].count,
		userQueueCount: userQueueCount[0].count,
		applicationQueueCount: applicationQueueCount[0].count
	}
}
