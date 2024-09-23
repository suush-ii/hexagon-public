import { building } from '$app/environment'
import { db } from '$lib/server/db'
import { configTable } from './schema/config'
const configPrepared = db.select().from(configTable).limit(1).prepare('configGrab')

type Config = typeof configTable.$inferSelect
let config: Config[]

if (!building) {
	try {
		config = await configPrepared.execute()
	} catch {
		config = [
			{
				maintenanceEnabled: true,
				registrationEnabled: false,
				gamesEnabled: false,
				developEnabled: false,
				keysEnabled: false,
				pageClicker: 0,
				sitealert: '',
				applicationsEnabled: false
			}
		]
		console.log('might wanna fix the db')
	}

	if (config.length === 0) {
		await db.insert(configTable).values({})
	}
}

export function get() {
	return config
}

export async function set(newConfig: Omit<Omit<Config, 'pageClicker'>, 'sitealert'>) {
	config[0].developEnabled = newConfig.developEnabled
	config[0].gamesEnabled = newConfig.gamesEnabled
	config[0].keysEnabled = newConfig.keysEnabled
	config[0].maintenanceEnabled = newConfig.maintenanceEnabled
	config[0].registrationEnabled = newConfig.registrationEnabled
	config[0].applicationsEnabled = newConfig.applicationsEnabled

	await db.update(configTable).set({
		maintenanceEnabled: newConfig.maintenanceEnabled,
		registrationEnabled: newConfig.registrationEnabled,
		keysEnabled: newConfig.keysEnabled,
		gamesEnabled: newConfig.gamesEnabled,
		developEnabled: newConfig.developEnabled,
		applicationsEnabled: newConfig.applicationsEnabled
	})
}

export async function setSitealert(sitealert: string) {
	config[0].sitealert = sitealert

	await db.update(configTable).set({
		sitealert
	})
}

export async function incrementClicker() {
	config[0].pageClicker++

	await db.update(configTable).set({
		pageClicker: config[0].pageClicker
	})
}

// this only works in single node instances not edge caching like this signifcantly reduces ping
