import type { GearAttributes, assetStates, gameGenre } from '$lib/types'
import type { clientVersions } from '$lib/types'
import { relations, sql } from 'drizzle-orm'
import {
	bigint,
	bigserial,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
	jsonb,
	PgArray
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
	serversize: integer('serversize').notNull(),
	updated: timestamp('updated', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	genre: text('genre').$type<gameGenre>().notNull(),
	// below is image sttufz
	iconurl: text('iconurl'),
	thumbnailurl: text('thumbnailurl'),
	iconstatus: text('iconstatus').$type<assetStates>(),
	thumbnailstatus: text('thumbnailstatus').$type<assetStates>(),
	likes: bigint('likes', { mode: 'number' }).notNull().default(0),
	dislikes: bigint('dislikes', { mode: 'number' }).notNull().default(0)
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
	placeurl: text('placeurl'),
	allowedgear: text('allowedgear')
		.notNull()
		.$type<GearAttributes>()
		.array()
		.$type<GearAttributes[]>()
		.default(sql`'{}'::text[]`),
	geargenreenforced: boolean('geargenreenforced').notNull().default(false)
})

export const placesRelations = relations(placesTable, ({ one, many }) => ({
	associatedgame: one(gamesTable, {
		fields: [placesTable.universeid],
		references: [gamesTable.universeid]
	}),
	jobs: many(jobsTable)
}))

export const jobsTable = pgTable('jobs', {
	jobid: uuid('jobid').notNull().primaryKey().defaultRandom(),
	placeid: bigint('placeid', { mode: 'number' }),
	associatedid: bigint('associatedid', { mode: 'number' }),
	type: text('type').$type<'game' | 'render' | 'renderobj'>().notNull(),
	clientversion: text('clientversion').$type<clientVersions>().notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	active: integer('active').default(0), // how mnay people are in the instance used for games only
	status: integer('status').default(1), // 2 is done loading and 1 is loading
	port: integer('port').default(0),
	players: bigint('players', { mode: 'number' })
		.array()
		.$type<number[]>()
		.default(sql`'{}'::bigint[]`)
})

export const jobsRelations = relations(jobsTable, ({ one, many }) => ({
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
	}),
	activeusers: many(usersTable) // so we can fetch all the users in a job
}))
