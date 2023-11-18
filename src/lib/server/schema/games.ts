import type { assetStates, gameGenre } from '$lib/types'
import type { clientVersions } from '$lib/types'
import { relations } from 'drizzle-orm'
import {
	bigint,
	bigserial,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	boolean
} from 'drizzle-orm/pg-core'
import { usersTable } from './users'
import { assetTable } from './assets'

export const gamesTable = pgTable('games', {
	universeid: bigserial('universeid', { mode: 'number' }).unique().notNull().primaryKey(),
	gamename: text('gamename').notNull(),
	description: text('description').notNull(),
	creatoruserid: bigint('creatoruserid', { mode: 'number' }).notNull(),
	active: bigint('active', { mode: 'number' }).notNull().default(0),
	visits: bigint('visits', { mode: 'number' }).notNull().default(0),
	serversize: integer('serversize'),
	updated: timestamp('updated', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	genre: text('genre').$type<gameGenre>().notNull(),
	// below is image sttufz
	iconurl: text('iconurl'),
	thumbnailurl: text('thumbnailurl'),
	iconstatus: text('iconstatus').$type<assetStates>(),
	thumbnailstatus: text('thumbnailstatus').$type<assetStates>()
})

export const gamesRelations = relations(gamesTable, ({ one, many }) => ({
	places: many(placesTable),
	author: one(usersTable, {
		fields: [gamesTable.creatoruserid],
		references: [usersTable.userid]
	})
}))

export const placesTable = pgTable('places', {
	placeid: bigint('placeid', { mode: 'number' }).notNull().primaryKey(),
	startplace: boolean('startplace').notNull().default(false), // we should never allow this to be changed https://devforum.roblox.com/t/changes-to-place-management/140039
	universeid: bigint('universeid', { mode: 'number' }).notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	updated: timestamp('updated', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	placeurl: text('placeurl')
})

export const placesRelations = relations(placesTable, ({ one, many }) => ({
	associatedgame: one(gamesTable, {
		fields: [placesTable.universeid],
		references: [gamesTable.universeid]
	}),
	jobs: many(jobsTable)
}))

export const jobsTable = pgTable('jobs', {
	jobid: uuid('jobid').notNull().primaryKey(),
	placeid: bigint('placeid', { mode: 'number' }),
	associatedid: bigint('associatedid', { mode: 'number' }),
	type: text('type').$type<'game' | 'render' | 'renderobj'>().notNull(),
	clientversion: text('clientversion').$type<clientVersions>().notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow()
})

export const jobsRelations = relations(jobsTable, ({ one }) => ({
	associatedplace: one(placesTable, {
		// games
		fields: [jobsTable.associatedid],
		references: [placesTable.universeid]
	}),
	associateditem: one(assetTable, {
		// item renders etc
		fields: [jobsTable.associatedid],
		references: [assetTable.assetid]
	}),
	associateduser: one(usersTable, {
		// user renders
		fields: [jobsTable.associatedid],
		references: [usersTable.userid]
	})
}))
