import {
	bigint,
	bigserial,
	integer,
	smallint,
	pgTable,
	text,
	timestamp,
	varchar,
	boolean,
	primaryKey,
	uuid
} from 'drizzle-orm/pg-core'
import type { userRole, userGenders, AssetTypes, HexagonBadges, HexagonClans } from '$lib/types'
import { relations, sql } from 'drizzle-orm'
import { keyTable } from './keys'
import { gamesTable, logsTable, placesTable } from './games'
import type { ActionTypes } from '../admin'
import { assetTable } from './assets'
import type { Action as moderationTypes } from '$src/routes/(main)/admin/users/moderateuser/schema'

// with timestamps ALWAYS USE WITHTIMEZONE!!!

export const usersTable = pgTable('users', {
	userid: bigserial('userid', { mode: 'number' }).notNull(),
	id: varchar('id', { length: 128 }).primaryKey(), // used for lucia serials are unable to be used for some reason
	username: text('username').notNull().unique(),
	coins: bigint('coins', { mode: 'number' }).notNull(),
	discordid: text('discordid'),
	joindate: timestamp('joindate', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
	role: text('role').$type<userRole>().notNull(),
	studiopresencelocation: bigint('studiopresencelocation', { mode: 'number' }),
	studiopresenceping: timestamp('studiopresenceping', { mode: 'date', withTimezone: true }),
	gender: text('gender').$type<userGenders>().notNull().default('nonbinary'),
	lastactivetime: timestamp('lastactivetime', { mode: 'date', withTimezone: true })
		.notNull()
		.defaultNow(),
	laststipend: timestamp('laststipend', { mode: 'date', withTimezone: true })
		.notNull()
		.defaultNow(),
	avatarheadshot: text('avatarheadshot'),
	avatarbody: text('avatarbody'),
	_3dmanifest: text('3dmanifest'),
	headcolor: smallint('headcolor').default(24).notNull(),
	leftarmcolor: smallint('leftarmcolor').default(24).notNull(),
	leftlegcolor: smallint('leftlegcolor').default(119).notNull(),
	rightarmcolor: smallint('rightarmcolor').default(24).notNull(),
	rightlegcolor: smallint('rightlegcolor').default(119).notNull(),
	torsocolor: smallint('torsocolor').default(23).notNull(), // noob colors
	registerip: text('registerip'),
	lastip: text('lastip'),
	banid: bigint('banid', { mode: 'number' }),
	blurb: text('blurb').notNull().default(''),
	scrubbedusername: text('scrubbedusername'),
	activegame: bigint('activegame', { mode: 'number' }),
	sitebadges: text('sitebadges')
		.$type<HexagonBadges>()
		.array()
		.notNull()
		.default(sql`'{}'::text[]`),
	knockouts: bigint('knockouts', { mode: 'number' }).notNull().default(0),
	wipeouts: bigint('wipeouts', { mode: 'number' }).notNull().default(0),
	registeredclan: text('registeredclan').$type<HexagonClans>(),
	activejob: uuid('jobid')
})

export const relationsTable = pgTable('relations', {
	requestid: bigserial('requestid', { mode: 'number' }).notNull().primaryKey(),
	sender: bigint('sender', { mode: 'number' }).notNull(),
	recipient: bigint('recipient', { mode: 'number' }).notNull(),
	time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	type: text('type').$type<'friend' | 'block' | 'follow' | 'request'>().notNull()
})

export const inventoryTable = pgTable('inventory', {
	inventoryid: bigserial('inventoryid', { mode: 'number' }).notNull().primaryKey(),
	userid: bigint('userid', { mode: 'number' }).notNull(),
	itemid: bigint('itemid', { mode: 'number' }).notNull(),
	wearing: boolean('wearing').notNull(),
	obatineddate: timestamp('obatineddate', { mode: 'date', withTimezone: true })
		.notNull()
		.defaultNow(),
	itemtype: text('itemtype').$type<AssetTypes>().notNull(),
	serialid: integer('serialid')
})

export const transactionsTable = pgTable('transactions', {
	transactionid: bigserial('transactionid', { mode: 'number' }).notNull().primaryKey(),
	userid: bigint('userid', { mode: 'number' }).notNull(),
	itemid: bigint('itemid', { mode: 'number' }),
	time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	type: text('type')
		.$type<'stipend' | 'purchase' | 'sales' | 'adjustment' | 'visit' | 'trade' | 'referral'>()
		.notNull(),
	amount: bigint('amount', { mode: 'number' }).notNull(),
	sourceuserid: bigint('sourceuserid', { mode: 'number' })
})

export const adminLogsTable = pgTable('adminlogs', {
	logid: bigserial('logid', { mode: 'number' }).notNull().primaryKey(),
	userid: bigint('userid', { mode: 'number' }).notNull(),
	associatedid: bigint('associatedid', { mode: 'number' }).notNull(),
	associatedidtype: text('associatedidtype').$type<'item' | 'user' | 'game' | 'job'>().notNull(),
	time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	action: text('action').$type<ActionTypes>().notNull(),
	banlength: text('banlength').$type<moderationTypes>(),
	newrole: text('newrole').$type<userRole>()
})

export const bansTable = pgTable('bans', {
	banid: bigserial('banid', { mode: 'number' }).notNull().primaryKey(),
	banlength: text('banlength').$type<moderationTypes>(),
	action: text('action').$type<moderationTypes>().notNull(),
	expiration: timestamp('expiration', { mode: 'date', withTimezone: true }).notNull(),
	time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	userid: bigint('userid', { mode: 'number' }).notNull(), // moderator
	reason: text('reason').notNull(),
	internalreason: text('internalreason').notNull(),
	moderatorid: bigint('moderatorid', { mode: 'number' }),
	offensivecontent: text('offensivecontent'),
	offensiveassetid: bigint('offensiveassetid', { mode: 'number' })
})

export const recentlyPlayedTable = pgTable('recentlyplayed', {
	recentlyplayedid: bigserial('recentlyplayedid', { mode: 'number' }).notNull().primaryKey(),
	userid: bigint('userid', { mode: 'number' }).notNull(),
	gameid: bigint('gameid', { mode: 'number' }).notNull(),
	time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow()
})

export const macAddressesTable = pgTable(
	'macaddresses',
	{
		userid: bigint('userid', { mode: 'number' }).notNull(),
		macAddress: text('macaddress').notNull(),
		banned: boolean('banned').notNull().default(false),
		time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.userid, table.macAddress] }) }
	}
)

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
	member: one(usersTable, {
		fields: [transactionsTable.sourceuserid],
		references: [usersTable.userid]
	}),
	item: one(assetTable, {
		fields: [transactionsTable.itemid],
		references: [assetTable.assetid]
	})
}))

export const adminLogsRelations = relations(adminLogsTable, ({ one }) => ({
	admin: one(usersTable, {
		fields: [adminLogsTable.userid],
		references: [usersTable.userid]
	}),
	game: one(gamesTable, {
		fields: [adminLogsTable.associatedid],
		references: [gamesTable.universeid]
	}),
	asset: one(assetTable, {
		fields: [adminLogsTable.associatedid],
		references: [assetTable.assetid]
	}),
	user: one(usersTable, {
		fields: [adminLogsTable.associatedid],
		references: [usersTable.userid]
	})
}))

export const recentlyPlayedRelations = relations(recentlyPlayedTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [recentlyPlayedTable.userid],
		references: [usersTable.userid]
	}),
	game: one(gamesTable, {
		fields: [recentlyPlayedTable.gameid],
		references: [gamesTable.universeid]
	})
}))

export const usersRelations = relations(usersTable, ({ many, one }) => ({
	keysCreated: many(keyTable),
	games: many(gamesTable),
	inventory: many(inventoryTable),
	bans: many(bansTable, { relationName: 'user' }),
	received: many(relationsTable, { relationName: 'received' }),
	sent: many(relationsTable, { relationName: 'sent' }),
	recentlyplayed: many(recentlyPlayedTable),
	activegame: one(placesTable, {
		fields: [usersTable.activegame],
		references: [placesTable.placeid]
	})
}))

export const relationsRelations = relations(relationsTable, ({ one }) => ({
	recipient: one(usersTable, {
		fields: [relationsTable.recipient],
		references: [usersTable.userid],
		relationName: 'received'
	}),
	sender: one(usersTable, {
		fields: [relationsTable.sender],
		references: [usersTable.userid],
		relationName: 'sent'
	})
}))

export const bansRelations = relations(bansTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [bansTable.userid],
		references: [usersTable.userid],
		relationName: 'user'
	}),
	moderator: one(usersTable, {
		fields: [bansTable.moderatorid],
		references: [usersTable.userid]
	}),
	offensiveasset: one(assetTable, {
		fields: [bansTable.offensiveassetid],
		references: [assetTable.assetid]
	})
}))

export const keysRelations = relations(keyTable, ({ one }) => ({
	author: one(usersTable, {
		fields: [keyTable.madebyuserid],
		references: [usersTable.userid]
	})
}))

export const inventoryRelations = relations(inventoryTable, ({ one }) => ({
	asset: one(assetTable, {
		fields: [inventoryTable.itemid],
		references: [assetTable.assetid]
	}),
	owner: one(usersTable, {
		fields: [inventoryTable.userid],
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
