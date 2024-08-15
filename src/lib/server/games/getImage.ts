import { sql } from 'drizzle-orm'
import { assetTable } from '../schema'
import type { PgTableWithColumns } from 'drizzle-orm/pg-core'

export const imageSql =
	sql`CASE WHEN ${assetTable.moderationstate} = 'approved' THEN ${assetTable.simpleasseturl} ELSE NULL END`.as(
		'simpleasseturl'
	)

export function aliasedimageSql(alias: PgTableWithColumns<any>) {
	return sql`CASE WHEN ${alias.moderationstate} = 'approved' THEN ${alias.simpleasseturl} ELSE NULL END`.as(
		'simpleasseturl'
	)
}
