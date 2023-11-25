import { bigint, boolean, pgTable } from 'drizzle-orm/pg-core'

//export const genderEnum = pgEnum("gender", ["Male", "Female", "Other"]) nvm :skull:
export const configTable = pgTable('config', {
	maintenanceEnabled: boolean('maintenanceenabled').notNull().default(false).primaryKey(),
	registrationEnabled: boolean('registrationenabled').notNull().default(true),
	gamesEnabled: boolean('gamesenabled').notNull().default(true),
	developEnabled: boolean('developEnabled').notNull().default(true),
	keysEnabled: boolean('keysenabled').notNull().default(false),
	pageClicker: bigint('pageclicker', { mode: 'number' }).notNull().default(0)
})
