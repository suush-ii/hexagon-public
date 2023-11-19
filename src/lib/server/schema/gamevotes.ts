import { pgTable, bigint, text, bigserial } from 'drizzle-orm/pg-core'

export const votesTable = pgTable('votes', {
	voteid: bigserial('voteid', { mode: 'number' }).notNull().primaryKey(),
	userid: bigint('userid', { mode: 'number' }).notNull(),
	gameid: bigint('gameid', { mode: 'number' }).notNull(),
	type: text('type').$type<'like' | 'dislike'>().notNull()
})
