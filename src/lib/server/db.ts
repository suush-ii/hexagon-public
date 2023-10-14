import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { DATABASE_URL } from '$env/static/private'
import { DATABASE_LOGS } from '$env/static/private'
export const client = postgres(DATABASE_URL)

export const db = drizzle(client, { logger: DATABASE_LOGS === 'true' ? true : false })
