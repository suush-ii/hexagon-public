import { relations } from 'drizzle-orm'
import { bigint, bigserial, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { gamesTable } from './games'
import type { assetStates } from '$lib/types'

export const assetTable = pgTable('assets', {
	assetid: bigserial('assetid', { mode: 'number' }).notNull().primaryKey(),
	assetname: text('assetname').notNull(),
	assetType: text('assettype').$type<'games' | 'audio' | 'decals'>().notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	creatoruserid: bigint('creatoruserid', { mode: 'number' }).notNull(),
	moderationstate: text('moderationstate').$type<assetStates>().notNull(),
	simpleasseturl: text('simpleasseturl') // simple assets like images/decals or whatever use this
})

export const assetRelations = relations(assetTable, ({ one }) => ({
	game: one(gamesTable, {
		fields: [assetTable.assetid],
		references: [gamesTable.gameid]
	})
}))
