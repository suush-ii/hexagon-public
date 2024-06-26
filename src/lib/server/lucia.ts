import { lucia } from 'lucia'
import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql'

import { dev } from '$app/environment'
import { sveltekit } from 'lucia/middleware'
import { client } from './db'
import { discord } from '@lucia-auth/oauth/providers'
import { env } from '$env/dynamic/private'

export const auth = lucia({
	adapter: postgresAdapter(client, { user: 'users', session: 'user_session', key: 'user_key' }),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	sessionCookie: {
		name: '.ROBLOSECURITY'
	},
	sessionExpiresIn: {
		activePeriod: 86400000, // 1 day
		idlePeriod: 1209600000 // 2 weeks
	},
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
	clientId: env.DISCORD_CLIENTID as string,
	clientSecret: env.DISCORD_CLIENTSECRET as string,
	redirectUri: ''
})

export type Auth = typeof auth
