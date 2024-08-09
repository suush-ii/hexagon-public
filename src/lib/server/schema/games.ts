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
	primaryKey
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
	iconid: bigint('iconid', { mode: 'number' }),
	thumbnailid: bigint('thumbnailid', { mode: 'number' }),
	likes: bigint('likes', { mode: 'number' }).notNull().default(0),
	dislikes: bigint('dislikes', { mode: 'number' }).notNull().default(0),
	scrubbedgamename: text('scrubbedgamename')
})

export const gamesRelations = relations(gamesTable, ({ one, many }) => ({
	places: many(placesTable),
	author: one(usersTable, {
		fields: [gamesTable.creatoruserid],
		references: [usersTable.userid]
	}),
	icon: one(assetTable, {
		fields: [gamesTable.iconid],
		references: [assetTable.assetid]
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
	geargenreenforced: boolean('geargenreenforced').notNull().default(false),
	placeversions: text('placeversions')
		.$type<string[]>()
		.array()
		.$type<string[]>()
		.default(sql`'{}'::text[]`)
})

export const placesRelations = relations(placesTable, ({ one, many }) => ({
	associatedgame: one(gamesTable, {
		fields: [placesTable.universeid],
		references: [gamesTable.universeid]
	}),
	jobs: many(jobsTable),
	associatedasset: one(assetTable, {
		fields: [placesTable.placeid],
		references: [assetTable.assetid]
	})
}))

export const jobsTable = pgTable('jobs', {
	jobid: uuid('jobid').notNull().primaryKey().defaultRandom(),
	placeid: bigint('placeid', { mode: 'number' }),
	associatedid: bigint('associatedid', { mode: 'number' }),
	type: text('type').$type<'game' | 'render' | 'renderobj'>().notNull(),
	rendertype: text('rendertype').$type<'asset' | 'user'>(),
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

export const legacyPersistenceTable = pgTable(
	'legacypersistence',
	{
		placeid: bigint('placeid', { mode: 'number' }).notNull(),
		userid: bigint('userid', { mode: 'number' }).notNull(),
		data: text('data').notNull()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.userid, table.placeid] }) }
	}
)

export const persistenceTable = pgTable(
	'persistence',
	{
		placeid: bigint('placeid', { mode: 'number' }).notNull(),
		key: text('key').notNull(),
		type: text('type').$type<'standard' | 'sorted'>().notNull(),
		scope: text('scope').notNull(),
		target: text('target').notNull(),
		value: text('value').notNull()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.placeid, table.target, table.scope] }) } // there should only exist one placeid with that key
	}
)

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
