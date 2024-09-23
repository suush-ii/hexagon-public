// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			success: boolean
			message: string
			data?: object
		}
		declare namespace Lucia {
			type Auth = import('./lib/server/lucia.ts').Auth
			type DatabaseUserAttributes = {
				username: string
				userid: number // the database will automatically fill this in
				email: string
				coins: number
				joindate: Date
				gender: import('./lib/types.ts').userGenders
				role: import('./lib/types.ts').userRole
				banid: number
			}
			type DatabaseSessionAttributes = NonNullable<unknown>
		}
		interface Locals {
			auth: import('lucia').AuthRequest
			user: Lucia.DatabaseUserAttributes
			config: {
				maintenanceEnabled: boolean
				registrationEnabled: boolean
				keysEnabled: boolean
				pageClicker: number
				gamesEnabled: boolean
				developEnabled: boolean
				sitealert: string
				applicationsEnabled: boolean
			}[]
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {}
