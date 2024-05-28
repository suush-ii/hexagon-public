import { boolean, pgTable, text, timestamp, bigint } from 'drizzle-orm/pg-core'

export const keyTable = pgTable('keys', {
	key: text('key').notNull().primaryKey(),
	madebyuserid: bigint('madeby', { mode: 'number' }).notNull(),
	claimedby: bigint('claimedby', { mode: 'number' }),
	expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
	useable: boolean('useable').notNull(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).notNull().defaultNow()
})
