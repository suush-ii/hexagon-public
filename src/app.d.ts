// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			success: boolean;
			message: string;
			data?: object;
		}
		declare namespace Lucia {
			type Auth = import("./lib/server/lucia.ts").Auth;
			type DatabaseUserAttributes = {
				username: string,
				userid?: undefined // the database will automatically fill this in
				email: string,
				coins: number,
				joindate: Date,
				role: "owner" | "admin" | "mod" | "uploader" | "normal"
	
			};
			type DatabaseSessionAttributes = {};
		}
		interface Locals {
			auth: import("lucia").AuthRequest,
			session: import("lucia").Session,
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
