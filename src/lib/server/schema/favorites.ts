import { pgTable, bigint } from 'drizzle-orm/pg-core'

export const favoritesTable = pgTable('favorites', {
	userid: bigint('userid', { mode: 'number' }).notNull(),
	assetid: bigint('assetid', { mode: 'number' }).notNull().primaryKey()
})
