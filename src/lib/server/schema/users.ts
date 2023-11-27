import { bigint, bigserial, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import type { userState } from '$lib/types'
import type { userRole } from '$lib/types'
import { relations } from 'drizzle-orm'
import { keyTable } from './keys'
import { gamesTable, jobsTable } from './games'

// with timestamps ALWAYS USE WITHTIMEZONE!!!

//export const genderEnum = pgEnum("gender", ["Male", "Female", "Other"]) nvm :skull:
export const usersTable = pgTable('users', {
	userid: bigserial('userid', { mode: 'number' }).notNull(),
	id: varchar('id', { length: 128 }).primaryKey(), // used for lucia serials are unable to be used for some reason
	username: text('username').notNull().unique(),
	coins: bigint('coins', { mode: 'number' }).notNull(),
	discordid: integer('discordid'),
	joindate: timestamp('joindate', { mode: 'date', withTimezone: true }).notNull(),
	role: text('role').$type<userRole>().notNull(),
	state: text('state').$type<userState>().notNull().default('offline'),
	lastactivetime: timestamp('lastactivetime', { mode: 'date', withTimezone: true })
		.notNull()
		.defaultNow(),
	avatarheadshot: text('avatarheadshot'),
	avatarbody: text('avatarbody'),
	avatarobj: text('avatarobj')
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
