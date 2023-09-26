// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			success: boolean,
			message: string,
			data?: Object
		}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
