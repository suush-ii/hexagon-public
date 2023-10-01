import type { PageServerLoad, Actions } from './$types';
import { setError, message, superValidate } from 'sveltekit-superforms/server';
import { formSchema, validateSchema } from '$lib/schemas/signupschema';
import { fail, redirect } from '@sveltejs/kit';
import { configTable } from '$src/lib/server/schema/config';
import { db } from '$src/lib/server/db';
import { auth } from '$src/lib/server/lucia';
import { PostgresError } from 'postgres';
import { usersTable } from '$src/lib/server/schema/users';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const config = await db.select().from(configTable).limit(1);

	const session = await event.locals.auth.validate();
	if (session) throw redirect(302, '/home');

	return {
		form: superValidate(formSchema),
		clicker: config?.[0]?.pageClicker ?? 0,
		registration: config?.[0]?.registrationEnabled ?? true
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, validateSchema);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const { username, password } = form.data;

		const config = await db.select().from(configTable).limit(1);

		if (config?.[0]?.registrationEnabled === false) {
			return message(form, 'Registration disabled.');
		}

		const user = await db
		.select({
			username: usersTable.username
		})
		.from(usersTable)
		.where(eq(usersTable.username, username))
		.limit(1);

	if (user.length != 0) {
		return setError(form, 'username', 'Username taken!');
	}

		try {
			const nUser = await auth.createUser({
				key: {
					providerId: 'username',
					providerUserId: username.toLowerCase(),
					password: password
				},
				attributes: {
					username: username,
					coins: 0,
					joindate: new Date(),
					role: 'normal'
				}
			});

			const session = await auth.createSession({
				userId: nUser.userId,
				attributes: {}
			});
			event.locals.auth.setSession(session); // set session cookie
		} catch (e) {
			//console.log(e)
			if (e instanceof PostgresError && e.code === '23505') {
				return setError(form, 'username', 'Username taken!');
			}

			return fail(400, form); // wtf happened!!
		}

		throw redirect(301, '/home');
	}
};
