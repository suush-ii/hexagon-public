import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { configTable } from '$lib/server/schema/config';
import { DEBUG } from '$env/static/private';
import { db } from '$lib/server/db';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { auth } from '$lib/server/lucia';

const protectedRoutes = ['/account/dashboard'];
const adminProtectedRoutes = ['/temp/keygen'];

await migrate(db, { migrationsFolder: './drizzle' });

export const handle: Handle = async ({ event, resolve }) => {
	console.log(event.request.headers)
	// Stage 1

	const config = await db.select().from(configTable).limit(1);

	if (config.length === 0) {
		await db.insert(configTable).values({});
	}

	if (config?.[0]?.maintenanceEnabled === true) {
		if (event.url.pathname != '/maintenance') {
			throw redirect(302, '/maintenance');
		}
	}

	event.locals.auth = auth.handleRequest(event);

	const session = await event.locals.auth.validate();
	if (session) {
		event.locals.session = session;
	}

	/*if (protectedRoutes.includes(event.url.pathname) === true || protectedRoutes.some(substr => event.url.pathname.toLowerCase().startsWith(substr.toLowerCase())) === true) {
		if (!session) {
			throw redirect(302, "/auth/login")
		}
	}

    if (adminProtectedRoutes.includes(event.url.pathname) === true || adminProtectedRoutes.some(substr => event.url.pathname.toLowerCase().startsWith(substr.toLowerCase())) === true) {
		if (!session) {
			throw redirect(302, "/auth/login")
		}

        if (session.user.role !== "owner" && session.user.role !== "admin" && session.user.role !== "mod") {
            throw redirect(302, "/auth/login")
        }
	}*/

	const response = await resolve(event); // Stage 2
	//await pool.end();

	// Stage 3

	return response;
};
