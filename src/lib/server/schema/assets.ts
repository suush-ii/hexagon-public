import { relations, sql } from 'drizzle-orm'
import {
	bigint,
	integer,
	bigserial,
	pgTable,
	text,
	timestamp,
	boolean,
	primaryKey
} from 'drizzle-orm/pg-core'
import { gamesTable, placesTable } from './games'
import type {
	assetStates,
	AssetTypes,
	AssetGenreDB,
	GearAttributes,
	HexagonClans
} from '$lib/types'
import { inventoryTable, usersTable } from './users'

export const assetTable = pgTable('assets', {
	assetid: bigserial('assetid', { mode: 'number' }).notNull().primaryKey(),
	assetname: text('assetname').notNull(),
	assetType: text('assettype')
		.$type<AssetTypes /* Images are used internally for things likes shirts and pants */>()
		.notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	updated: timestamp('updated', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	creatoruserid: bigint('creatoruserid', { mode: 'number' }).notNull(),
	moderationstate: text('moderationstate').$type<assetStates>().notNull(),
	simpleasseturl: text('simpleasseturl'), // simple assets like images/decals or whatever use this
	sales: bigint('sales', { mode: 'number' }).notNull().default(0),
	associatedimageid: bigint('associatedimageid', { mode: 'number' }),
	price: integer('price'),
	description: text('description'),
	assetrender: text('assetrender'),
	_3dmanifest: text('3dmanifest'),
	genres: text('genres')
		.$type<AssetGenreDB>()
		.array()
		.$type<AssetGenreDB[]>()
		.default(['All'])
		.notNull(),
	gearattributes: text('gearattributes').$type<GearAttributes>().array().$type<GearAttributes[]>(),
	topunish: boolean('topunish').default(false),
	punished: boolean('punished').default(false),
	onsale: boolean('onsale').notNull().default(true),
	assetversions: text('assetversions')
		.$type<string[]>()
		.array()
		.$type<string[]>()
		.default(sql`'{}'::text[]`),
	scrubbedassetname: text('scrubbedassetname'),
	favorites: bigint('favorites', { mode: 'number' }).notNull().default(0),
	lastweekreset: timestamp('lastweekreset', { mode: 'date', withTimezone: true })
		.notNull()
		.defaultNow(),
	last7dayscounter: bigint('last7dayscounter', { mode: 'number' }).notNull().default(0), // every week this is reset using the timestamp above
	stock: integer('stock'),
	stocklimit: integer('stocklimit'),
	limited: text('limited').$type<'limited' | 'limitedu'>(),
	recentaverageprice: integer('recentaverageprice'),
	associatedgameid: bigint('associatedgameid', { mode: 'number' }) // badges / gamepasses
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
	}),
	assetversions: one(assetVersionsTable, {
		fields: [assetTable.assetid],
		references: [assetVersionsTable.assetid]
	})
}))

export const privateSellersTable = pgTable(
	'privatesellers',
	{
		userid: bigint('userid', { mode: 'number' }).notNull(),
		assetid: bigint('assetid', { mode: 'number' }).notNull(),
		inventoryid: integer('inventoryid').notNull(),
		price: integer('price').notNull(),
		created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.userid, table.assetid, table.inventoryid] }) }
	}
)

export const privateSellersRelations = relations(privateSellersTable, ({ one }) => ({
	item: one(inventoryTable, {
		fields: [privateSellersTable.inventoryid],
		references: [inventoryTable.inventoryid]
	}),
	user: one(usersTable, {
		fields: [privateSellersTable.userid],
		references: [usersTable.userid]
	})
}))

export const salesHistoryTable = pgTable('saleshistory', {
	saleshistoryid: bigserial('saleshistoryid', { mode: 'number' }).notNull().primaryKey(),
	userid: bigint('userid', { mode: 'number' }).notNull(),
	assetid: bigint('assetid', { mode: 'number' }).notNull(),
	inventoryid: integer('inventoryid').notNull(),
	price: integer('price').notNull(),
	time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	currentaverageprice: integer('currentaverageprice').notNull()
})

export const tradesTable = pgTable('trades', {
	requestid: bigserial('requestid', { mode: 'number' }).notNull().primaryKey(),
	senderid: bigint('senderid', { mode: 'number' }).notNull(),
	recipient: bigint('recipient', { mode: 'number' }).notNull(),
	time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	status: text('status').$type<'pending' | 'accepted' | 'denied'>().notNull().default('pending'),
	denyreason: text('denyreason').$type<'error' | 'denied' | 'countered'>(),
	offering: bigint('offering', { mode: 'number' }).array().notNull(),
	requesting: bigint('requesting', { mode: 'number' }).array().notNull(),
	offeringmoons: integer('offeringmoons').notNull(),
	requestingmoons: integer('requestingmoons').notNull()
})

export const tradesRelations = relations(tradesTable, ({ one }) => ({
	sender: one(usersTable, {
		fields: [tradesTable.senderid],
		references: [usersTable.userid]
	}),
	recipient: one(usersTable, {
		fields: [tradesTable.recipient],
		references: [usersTable.userid]
	})
}))

export const assetCacheTable = pgTable('assetcache', {
	assetid: bigint('assetid', { mode: 'number' }).notNull().primaryKey(),
	assettypeid: integer('assettypeid').notNull().default(0),
	filehash: text('filehash'),
	expiration: timestamp('expiration', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	token: text('token').notNull().default('')
})

export const assetVersionCacheTable = pgTable('assetversioncache', {
	assetversionid: bigint('assetversionid', { mode: 'number' }).notNull().primaryKey(),
	assettypeid: integer('assettypeid').notNull().default(0),
	filehash: text('filehash'),
	expiration: timestamp('expiration', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	token: text('token').notNull().default('')
})

export const assetThumbnailCacheTable = pgTable('assetthumbnailcache', {
	assetid: bigint('assetid', { mode: 'number' }).notNull().primaryKey(),
	filehash: text('filehash')
})

export const assetVersionsTable = pgTable(
	'assetversions',
	{
		assetid: bigint('assetid', { mode: 'number' }).notNull(),
		filehash: text('filehash').notNull(),
		time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.assetid, table.time] }) }
	}
)

export const eventItemsTable = pgTable(
	'eventitems',
	{
		badgeid: bigint('badgeid', { mode: 'number' }).notNull().unique(),
		awardid: bigint('awardid', { mode: 'number' }).notNull()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.badgeid, table.awardid] }) }
	}
)

export const clanItemsTable = pgTable(
	'clanitems',
	{
		clan: text('clan').$type<HexagonClans>().unique(),
		awardid: bigint('awardid', { mode: 'number' }).notNull()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.clan, table.awardid] }) }
	}
)

export const userAdsTable = pgTable('userads', {
	useradid: bigserial('useradid', { mode: 'number' }).notNull().primaryKey(),
	assetname: text('assetname').notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	creatoruserid: bigint('creatoruserid', { mode: 'number' }).notNull(),
	impressionscurrent: bigint('impressionscurrent', { mode: 'number' }).notNull().default(0),
	impressionstotal: bigint('impressionstotal', { mode: 'number' }).notNull().default(0),
	clickscurrent: bigint('clicks', { mode: 'number' }).notNull().default(0),
	clickstotal: bigint('clickstotal', { mode: 'number' }).notNull().default(0),
	clickthroughrate: integer('clickthroughrate').notNull().default(0),
	totalclickthroughrate: integer('totalclickthroughrate').notNull().default(0),
	bid: bigint('bid', { mode: 'number' }).notNull().default(0),
	totalbid: bigint('totalbid', { mode: 'number' }).notNull().default(0),
	associatedimageid: bigint('associatedimageid', { mode: 'number' }).notNull(),
	scrubbedassetname: text('scrubbedassetname'),
	assocatedassetid: bigint('assocatedassetid', { mode: 'number' }).notNull(), // game / shirt / pants / etc
	associatedassetype: text('associatedassetype').$type<AssetTypes>().notNull(),
	bidexpires: timestamp('bidexpires', { mode: 'date', withTimezone: true }).notNull(),
	adsize: text('adsize').$type<'skyscraper' | 'rectangle' | 'banner'>().notNull()
})

export const userAdsRelations = relations(userAdsTable, ({ one }) => ({
	associatedImage: one(assetTable, {
		fields: [userAdsTable.associatedimageid],
		references: [assetTable.assetid]
	}),
	associatedAsset: one(assetTable, {
		fields: [userAdsTable.assocatedassetid],
		references: [assetTable.assetid]
	}),
	associatedGame: one(gamesTable, {
		fields: [userAdsTable.assocatedassetid],
		references: [gamesTable.universeid]
	})
}))
