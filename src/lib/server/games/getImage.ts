import { sql } from 'drizzle-orm'
import { assetTable } from '../schema'

export const imageSql =
	sql`CASE WHEN ${assetTable.moderationstate} = 'approved' THEN ${assetTable.simpleasseturl} ELSE NULL END`.as(
		'simpleasseturl'
	)
