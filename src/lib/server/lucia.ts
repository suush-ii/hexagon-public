import { lucia } from 'lucia';
import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql';

import { dev } from '$app/environment';
import { sveltekit } from 'lucia/middleware';
import { client } from './db';

export const auth = lucia({
	adapter: postgresAdapter(client, { user: 'users', session: 'user_session', key: 'user_key' }),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),

	getUserAttributes: (data) => {
		return {
			username: data.username,
			userid: data.userid,
			coins: data.coins,
			role: data.role,
			joindate: data.joindate
		};
	}
});

export type Auth = typeof auth;
