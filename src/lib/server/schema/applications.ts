import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, bigint, boolean, uuid, json } from 'drizzle-orm/pg-core'
import { usersTable } from './users'

export const applicationsTable = pgTable('applications', {
	applicationid: uuid('applicationid').notNull().defaultRandom().primaryKey(),
	questions: json('questions').notNull().array().$type<{ question: string; answer: string }[]>(),
	created: timestamp('created', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
	reviewed: timestamp('reviewed', { mode: 'date', withTimezone: true }),
	revieweruserid: bigint('revieweruserid', { mode: 'number' }),
	accepted: boolean('accepted'),
	discordid: text('discordid'),
	verificationsequence: text('verificationsequence').notNull(),
	registerip: text('registerip'),
	used: boolean('used').default(false),
	signupuserid: bigint('signupuserid', { mode: 'number' }),
	internalreason: text('internalreason'),
	refereruserid: bigint('refereruserid', { mode: 'number' })
})

export const applicationsRelations = relations(applicationsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [applicationsTable.signupuserid],
		references: [usersTable.userid]
	})
}))
