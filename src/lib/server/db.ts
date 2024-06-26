import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '$env/dynamic/private'

import * as schema from './schema'
export const client = postgres(env.DATABASE_URL as string)

export const db = drizzle(client, { schema, logger: env.DATABASE_LOGS === 'true' ? true : false })
