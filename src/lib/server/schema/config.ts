import { boolean, integer, pgTable } from 'drizzle-orm/pg-core'

//export const genderEnum = pgEnum("gender", ["Male", "Female", "Other"]) nvm :skull:
export const configTable = pgTable('config', {
	maintenanceEnabled: boolean('maintenanceenabled').notNull().default(false).primaryKey(),
	registrationEnabled: boolean('registrationenabled').notNull().default(true),
	keysEnabled: boolean('keysenabled').notNull().default(false),
	pageClicker: integer('pageclicker').notNull().default(0)
})
