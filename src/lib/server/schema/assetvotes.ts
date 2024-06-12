import { pgTable, bigint, bigserial, primaryKey } from 'drizzle-orm/pg-core'

export const assetFavoritesTable = pgTable(
	'assetfavorites',
	{
		userid: bigint('userid', { mode: 'number' }).notNull(),
		assetid: bigint('assetid', { mode: 'number' }).notNull()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.userid, table.assetid] }) }
	}
)
