import { relations } from 'drizzle-orm'
import { pgTable, bigint, primaryKey } from 'drizzle-orm/pg-core'
import { assetTable } from './assets'

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

export const favoritesRelations = relations(assetFavoritesTable, ({ one }) => ({
	asset: one(assetTable, {
		fields: [assetFavoritesTable.assetid],
		references: [assetTable.assetid]
	})
}))
