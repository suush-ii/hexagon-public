import { db } from '$lib/server/db'
import { configTable } from './schema/config'
const configPrepared = db.select().from(configTable).limit(1).prepare('configGrab')

type Config = typeof configTable.$inferSelect

let config = await configPrepared.execute()

if (config.length === 0) {
	await db.insert(configTable).values({})
}

export function get() {
	return config
}

export async function set(newConfig: Config) {
	config[0] = newConfig
	await db.update(configTable).set(newConfig)
}

// this only works in single node instances not edge caching like this signifcantly reduces ping
