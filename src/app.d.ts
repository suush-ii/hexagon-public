// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			success: boolean;
			message: string;
			data?: object;
		}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
