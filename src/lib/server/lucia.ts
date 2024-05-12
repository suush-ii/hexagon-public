import { lucia } from 'lucia'
import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql'

import { dev } from '$app/environment'
import { sveltekit } from 'lucia/middleware'
import { client } from './db'
import { discord } from '@lucia-auth/oauth/providers'
import { DISCORD_CLIENTID } from '$env/static/private'
import { DISCORD_CLIENTSECRET } from '$env/static/private'

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
			joindate: data.joindate,
			lastactivetime: data.lastactivetime,
			laststipend: data.laststipend,
			gender: data.gender,
			banid: data.banid
		}
	}
})

export const discordAuth = discord(auth, {
	clientId: DISCORD_CLIENTID,
	clientSecret: DISCORD_CLIENTSECRET,
	redirectUri: ''
})

export type Auth = typeof auth
