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
import { placesTable } from './games'
import type { assetStates, AssetTypes, AssetGenreDB, GearAttributes } from '$lib/types'
import { usersTable } from './users'

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
	last7dayscounter: bigint('last7dayscounter', { mode: 'number' }).notNull().default(0) // every week this is reset using the timestamp above
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

export const assetCacheTable = pgTable('assetcache', {
	assetid: bigint('assetid', { mode: 'number' }).notNull().primaryKey(),
	assettypeid: integer('assettypeid').notNull().default(0),
	filehash: text('filehash')
})

export const assetThumbnailCacheTable = pgTable('assetthumbnailcache', {
	assetid: bigint('assetid', { mode: 'number' }).notNull().primaryKey(),
	filehash: text('filehash')
})

export const assetVersionsTable = pgTable(
	'assetversions',
	{
		assetid: bigint('assetid', { mode: 'number' }).notNull(),
		filehash: text('filehash'),
		time: timestamp('time', { mode: 'date', withTimezone: true }).notNull().defaultNow()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.assetid, table.time] }) }
	}
)
