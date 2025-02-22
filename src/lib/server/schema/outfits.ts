import { bigserial, bigint, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core'
import type { poses } from '$lib/types'

export const outfitsTable = pgTable('outfits', {
	outfitid: bigserial('outfitid', { mode: 'number' }).notNull().primaryKey(),
	assets: bigint('assets', { mode: 'number' }).array().$type<number[]>().notNull(),
	associatedpackageid: bigint('associatedpackageid', { mode: 'number' }),
	ownerid: bigint('ownerid', { mode: 'number' }),
	headcolor: smallint('headcolor'),
	leftarmcolor: smallint('leftarmcolor'), // unused for packages
	leftlegcolor: smallint('leftlegcolor'),
	rightarmcolor: smallint('rightarmcolor'),
	rightlegcolor: smallint('rightlegcolor'),
	torsocolor: smallint('torsocolor'),
	avatarbody: text('avatarbody'),
	outfitname: text('outfitname'),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	pose: text('pose').$type<poses>().notNull().default('normal')
})
