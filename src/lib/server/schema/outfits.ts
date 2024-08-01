import { bigserial, bigint, pgTable, smallint } from 'drizzle-orm/pg-core'

export const outfitsTable = pgTable('outfits', {
	outfitid: bigserial('outfitid', { mode: 'number' }).notNull().primaryKey(),
	assets: bigint('assets', { mode: 'number' }).array().$type<number[]>().notNull(),
	associatedpackageid: bigint('associatedpackageid', { mode: 'number' }),
	headcolor: smallint('headcolor'),
	leftarmcolor: smallint('leftarmcolor'), // unused for packages
	leftlegcolor: smallint('leftlegcolor'),
	rightarmcolor: smallint('rightarmcolor'),
	rightlegcolor: smallint('rightlegcolor'),
	torsocolor: smallint('torsocolor')
})
