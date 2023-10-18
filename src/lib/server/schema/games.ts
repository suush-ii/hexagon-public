import type { gameGenre } from "$src/lib/types"
import { relations } from "drizzle-orm"
import { bigint, bigserial, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"


export const gamesTable = pgTable('games', {
	gameid: bigserial('gameid', {mode: "number"}).notNull().primaryKey(),
	universeid: bigserial('universeid', {mode: "number"}).unique().notNull(),
	gamename: text('gamename').notNull(),
	creatoruserid: bigint('creatoruserid', { mode: 'number' }).notNull(),
    active: bigint('active', { mode: 'number' }).notNull(),
	visits: bigint('visits', { mode: 'number' }).notNull(),
    serversize: integer('serversize'),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull(),
    updated: timestamp('updated', { mode: 'date', withTimezone: true }).notNull(),
    genre: text('genre').$type<gameGenre>().notNull()
})

export const gamesRelations = relations(gamesTable, ({ many }) => ({
	places: many(placesTable),
}));

export const placesTable = pgTable('places', {
	placeid: bigserial('gameid', {mode: "number"}).notNull().primaryKey(),
	universeid: bigserial('universeid', {mode: "number"}).notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull(),
    updated: timestamp('updated', { mode: 'date', withTimezone: true }).notNull()
})

export const placesRelations = relations(placesTable, ({ one }) => ({
	author: one(gamesTable, {
		fields: [placesTable.universeid],
		references: [gamesTable.universeid],
	}),
}));