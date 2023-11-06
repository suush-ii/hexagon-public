import type { gameGenre } from '$lib/types'
import type { clientVersions } from '$lib/types'
import { relations } from 'drizzle-orm'
import { bigint, bigserial, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const gamesTable = pgTable('games', {
	gameid: bigint('gameid', { mode: 'number' }).notNull().primaryKey(),
	universeid: bigserial('universeid', { mode: 'number' }).unique().notNull(),
	gamename: text('gamename').notNull(),
	description: text('gamename').notNull(),
	creatoruserid: bigint('creatoruserid', { mode: 'number' }).notNull(),
	active: bigint('active', { mode: 'number' }).notNull(),
	visits: bigint('visits', { mode: 'number' }).notNull(),
	serversize: integer('serversize'),
	updated: timestamp('updated', { mode: 'date', withTimezone: true }).notNull(),
	genre: text('genre').$type<gameGenre>().notNull()
})

export const gamesRelations = relations(gamesTable, ({ many }) => ({
	places: many(placesTable)
}))

export const placesTable = pgTable('places', {
	placeid: bigserial('gameid', { mode: 'number' }).notNull().primaryKey(),
	universeid: bigint('universeid', { mode: 'number' }).notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull(),
	updated: timestamp('updated', { mode: 'date', withTimezone: true }).notNull(),
	placeurl: text('placeurl')
})

export const placesRelations = relations(placesTable, ({ one, many }) => ({
	author: one(gamesTable, {
		fields: [placesTable.universeid],
		references: [gamesTable.universeid]
	}),
	jobs: many(jobsTable)
}))

export const jobsTable = pgTable('jobs', {
	jobid: uuid('jobid').notNull().primaryKey(),
	placeid: bigint('placeid', { mode: 'number' }),
	universeid: bigint('universeid', { mode: 'number' }),
	type: text('type').$type<'game' | 'render' | 'renderobj'>().notNull(),
	clientversion: text('clientversion').$type<clientVersions>().notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull()
})

export const jobsRelations = relations(jobsTable, ({ one }) => ({
	author: one(placesTable, {
		fields: [jobsTable.universeid],
		references: [placesTable.universeid]
	})
}))
