import {
	bigint,
	bigserial,
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
	boolean
} from 'drizzle-orm/pg-core'
import type { userState, userRole, userGenders } from '$lib/types'
import { relations } from 'drizzle-orm'
import { keyTable } from './keys'
import { gamesTable, jobsTable } from './games'

// with timestamps ALWAYS USE WITHTIMEZONE!!!

export const usersTable = pgTable('users', {
	userid: bigserial('userid', { mode: 'number' }).notNull(),
	id: varchar('id', { length: 128 }).primaryKey(), // used for lucia serials are unable to be used for some reason
	username: text('username').notNull().unique(),
	coins: bigint('coins', { mode: 'number' }).notNull(),
	discordid: integer('discordid'),
	joindate: timestamp('joindate', { mode: 'date', withTimezone: true }).notNull(),
	role: text('role').$type<userRole>().notNull(),
	state: text('state').$type<userState>().notNull().default('offline'),
	gender: text('gender').$type<userGenders>().notNull().default('nonbinary'),
	lastactivetime: timestamp('lastactivetime', { mode: 'date', withTimezone: true })
		.notNull()
		.defaultNow(),
	laststipend: timestamp('laststipend', { mode: 'date', withTimezone: true })
		.notNull()
		.defaultNow(),
	avatarheadshot: text('avatarheadshot'),
	avatarbody: text('avatarbody'),
	avatarobj: text('avatarobj')
})

export const inventoryTable = pgTable('inventory', {
	inventoryid: bigserial('inventoryid', { mode: 'number' }).notNull().primaryKey(),
	userid: bigint('userid', { mode: 'number' }).notNull(),
	itemid: bigint('itemid', { mode: 'number' }).notNull(),
	wearing: boolean('wearing').notNull(),
	obatineddate: timestamp('obatineddate', { mode: 'date', withTimezone: true })
		.notNull()
		.defaultNow()
})

export const transactionsTable = pgTable('transactions', {
	transactionid: bigserial('transactionid', { mode: 'number' }).notNull().primaryKey(),
	userid: bigint('userid', { mode: 'number' }).notNull(),
	itemid: bigint('itemid', { mode: 'number' }),
	time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	type: text('type').$type<'stipend' | 'purchase' | 'sales' | 'adjustment'>().notNull(),
	amount: bigint('amount', { mode: 'number' }).notNull(),
	sourceuserid: bigint('sourceuserid', { mode: 'number' })
})

export const usersRelations = relations(usersTable, ({ many, one }) => ({
	keysCreated: many(keyTable),
	games: many(gamesTable),
	activegame: one(jobsTable, {
		fields: [usersTable.userid],
		references: [jobsTable.players]
	})
}))

export const keysRelations = relations(keyTable, ({ one }) => ({
	author: one(usersTable, {
		fields: [keyTable.madebyuserid],
		references: [usersTable.userid]
	})
}))

export const session = pgTable('user_session', {
	id: varchar('id', {
		length: 128
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => usersTable.id),
	activeExpires: bigint('active_expires', {
		mode: 'number'
	}).notNull(),
	idleExpires: bigint('idle_expires', {
		mode: 'number'
	}).notNull()
})

export const key = pgTable('user_key', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => usersTable.id),
	hashedPassword: varchar('hashed_password', {
		length: 255
	})
})
