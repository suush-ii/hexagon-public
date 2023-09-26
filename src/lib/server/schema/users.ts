import { bigint, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

//export const genderEnum = pgEnum("gender", ["Male", "Female", "Other"]) nvm :skull:
export const usersTable = pgTable('users', {
  userid: serial('userid').notNull(),
  id: varchar("id", {length: 128}).primaryKey(), // used for lucia serials are unable to be used for some reason
  username: text('username').notNull().unique(),
  email: text('email').notNull(),
  coins: bigint("coins",{mode: "number"}).notNull(),
  discordid: integer("discordid"),
  joindate: timestamp("joindate",{mode:"date"}).notNull(),
  role: text("role").$type<"owner" | "admin" | "mod" | "uploader" | "normal">().notNull(),
});

export const session = pgTable("user_session", {
	id: varchar("id", {
		length: 128
	}).primaryKey(),
	userId: varchar("user_id", {
		length: 15
	})
		.notNull()
		.references(() => usersTable.id),
	activeExpires: bigint("active_expires", {
		mode: "number"
	}).notNull(),
	idleExpires: bigint("idle_expires", {
		mode: "number"
	}).notNull()
});

export const key = pgTable("user_key", {
	id: varchar("id", {
		length: 255
	}).primaryKey(),
	userId: varchar("user_id", {
		length: 15
	})
		.notNull()
		.references(() => usersTable.id),
	hashedPassword: varchar("hashed_password", {
		length: 255
	})
});