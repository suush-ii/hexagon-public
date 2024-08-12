import * as dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'
dotenv.config()

export default defineConfig({
	schema: './src/lib/server/schema/*',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL as string
	}
})
