import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const keyTable = pgTable('keys', {
	key: text('key').notNull().primaryKey(),
	keyid: serial('keyid').notNull(),
	madeby: text('madeby').notNull(),
	claimedby: text('claimedby'),
	expires: timestamp('expires', { mode: 'date' }).notNull(),
	useable: boolean('useable').notNull()
})
