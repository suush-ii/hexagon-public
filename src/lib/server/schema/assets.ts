import { relations } from 'drizzle-orm'
import { bigint, integer, bigserial, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { placesTable } from './games'
import type { assetStates, assetTypes } from '$lib/types'
import { usersTable } from './users'

export const assetTable = pgTable('assets', {
	assetid: bigserial('assetid', { mode: 'number' }).notNull().primaryKey(),
	assetname: text('assetname').notNull(),
	assetType: text('assettype')
		.$type<assetTypes /* Images are used internally for things likes shirts and pants */>()
		.notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	updated: timestamp('updated', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	creatoruserid: bigint('creatoruserid', { mode: 'number' }).notNull(),
	moderationstate: text('moderationstate').$type<assetStates>().notNull(),
	simpleasseturl: text('simpleasseturl'), // simple assets like images/decals or whatever use this
	sales: bigint('sales', { mode: 'number' }).notNull().default(0),
	associatedimageid: bigint('associatedimageid', { mode: 'number' }),
	price: integer('price'),
	description: text('description')
})

export const assetRelations = relations(assetTable, ({ one }) => ({
	place: one(placesTable, {
		fields: [assetTable.assetid],
		references: [placesTable.placeid]
	}),
	author: one(usersTable, {
		fields: [assetTable.creatoruserid],
		references: [usersTable.userid]
	}),
	associatedImage: one(assetTable, {
		fields: [assetTable.associatedimageid],
		references: [assetTable.assetid]
	})
}))

export const assetCacheTable = pgTable('assetcache', {
	assetid: bigint('assetid', { mode: 'number' }).notNull().primaryKey(),
	assettypeid: integer('assettypeid').notNull().default(0),
	filehash: text('filehash')
})
