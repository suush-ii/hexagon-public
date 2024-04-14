import { relations } from 'drizzle-orm'
import { bigint, integer, bigserial, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { placesTable } from './games'
import type { assetStates } from '$lib/types'

export const assetTable = pgTable('assets', {
	assetid: bigserial('assetid', { mode: 'number' }).notNull().primaryKey(),
	assetname: text('assetname').notNull(),
	assetType: text('assettype').$type<'games' | 'audio' | 'decals'>().notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	creatoruserid: bigint('creatoruserid', { mode: 'number' }).notNull(),
	moderationstate: text('moderationstate').$type<assetStates>().notNull(),
	simpleasseturl: text('simpleasseturl'), // simple assets like images/decals or whatever use this
	sales: bigint('sales', { mode: 'number' }).notNull().default(0)
})

export const assetRelations = relations(assetTable, ({ one }) => ({
	place: one(placesTable, {
		fields: [assetTable.assetid],
		references: [placesTable.placeid]
	})
}))

export const assetCacheTable = pgTable('assetcache', {
	assetid: bigint('assetid', { mode: 'number' }).notNull().primaryKey(),
	assettypeid: integer('assettypeid').notNull().default(0),
	filehash: text('filehash')
})
