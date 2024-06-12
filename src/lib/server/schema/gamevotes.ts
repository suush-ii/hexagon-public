import { pgTable, bigint, text, primaryKey } from 'drizzle-orm/pg-core'

export const votesTable = pgTable(
	'votes',
	{
		userid: bigint('userid', { mode: 'number' }).notNull(),
		gameid: bigint('gameid', { mode: 'number' }).notNull(),
		type: text('type').$type<'like' | 'dislike'>().notNull()
	},
	(table) => {
		return { pk: primaryKey({ columns: [table.userid, table.gameid] }) }
	}
)
