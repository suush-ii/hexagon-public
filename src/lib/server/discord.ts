// https://raw.githubusercontent.com/discord/linked-roles-sample/

import { env } from '$env/dynamic/private'
import crypto from 'node:crypto'

type tokens = {
	access_token: string
	token_type: 'Bearer'
	expires_in: number
	refresh_token: string
	scope: 'identify'
}

type metadata = { has_account: number }

/**
 * Code specific to communicating with the Discord API.
 */

/**
 * The following methods all facilitate OAuth2 communication with Discord.
 * See https://discord.com/developers/docs/topics/oauth2 for more details.
 */

/**
 * Generate the url which the user will be directed to in order to approve the
 * bot, and see the list of requested scopes.
 */
export function getOAuthUrl() {
	const state = crypto.randomUUID()

	const url = new URL('https://discord.com/api/oauth2/authorize')
	url.searchParams.set('client_id', env.DISCORD_CLIENT_ID as string)
	url.searchParams.set('redirect_uri', env.DISCORD_REDIRECT_URI as string)
	url.searchParams.set('response_type', 'code')
	url.searchParams.set('state', state)
	url.searchParams.set('scope', 'role_connections.write identify')
	url.searchParams.set('prompt', 'consent')
	return { state, url: url.toString() }
}

/**
 * Given an OAuth2 code from the scope approval page, make a request to Discord's
 * OAuth2 service to retrieve an access token, refresh token, and expiration.
 */
export async function getOAuthTokens(code: string) {
	const url = 'https://discord.com/api/v10/oauth2/token'
	const body = new URLSearchParams({
		client_id: env.DISCORD_CLIENT_ID as string,
		client_secret: env.DISCORD_CLIENT_SECRET as string,
		grant_type: 'authorization_code',
		code: code,
		redirect_uri: env.DISCORD_REDIRECT_URI as string
	})

	const response = await fetch(url, {
		body,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
	if (response.ok) {
		const data = await response.json()
		return data
	} else {
		throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`)
	}
}

/**
 * The initial token request comes with both an access token and a refresh
 * token.  Check if the access token has expired, and if it has, use the
 * refresh token to acquire a new, fresh access token.
 */
export async function getAccessToken(userId: number, tokens: tokens) {
	if (Date.now() > tokens.expires_in) {
		const url = 'https://discord.com/api/v10/oauth2/token'
		const body = new URLSearchParams({
			client_id: env.DISCORD_CLIENT_ID as string,
			client_secret: env.DISCORD_CLIENT_SECRET as string,
			grant_type: 'refresh_token',
			refresh_token: tokens.refresh_token
		})
		const response = await fetch(url, {
			body,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
		if (response.ok) {
			const tokens = await response.json()
			tokens.expires_at = Date.now() + tokens.expires_in * 1000
			// await storage.storeDiscordTokens(userId, tokens);
			return tokens.access_token
		} else {
			throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`)
		}
	}
	return tokens.access_token
}

/**
 * Given a user based access token, fetch profile information for the current user.
 */
export async function getUserData(tokens: tokens) {
	const url = 'https://discord.com/api/v10/oauth2/@me'
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${tokens.access_token}`
		}
	})
	if (response.ok) {
		const data = await response.json()
		return data
	} else {
		throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`)
	}
}

/**
 * Given metadata that matches the schema, push that data to Discord on behalf
 * of the current user.
 */
export async function pushMetadata(userId: number, tokens: tokens, metadata: metadata) {
	// PUT /users/@me/applications/:id/role-connection
	const url = `https://discord.com/api/v10/users/@me/applications/${env.DISCORD_CLIENT_ID}/role-connection`
	const body = {
		platform_name: 'Hexagon',
		metadata
	}
	const response = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify(body),
		headers: {
			Authorization: `Bearer ${tokens.access_token}`,
			'Content-Type': 'application/json'
		}
	})
	if (!response.ok) {
		throw new Error(`Error pushing discord metadata: [${response.status}] ${response.statusText}`)
	}
}

/**
 * Fetch the metadata currently pushed to Discord for the currently logged
 * in user, for this specific bot.
 */
export async function getMetadata(userId: number, tokens: tokens) {
	// GET /users/@me/applications/:id/role-connection
	const url = `https://discord.com/api/v10/users/@me/applications/${env.DISCORD_CLIENT_ID}/role-connection`
	const accessToken = await getAccessToken(userId, tokens)
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})
	if (response.ok) {
		const data = await response.json()
		return data
	} else {
		throw new Error(`Error getting discord metadata: [${response.status}] ${response.statusText}`)
	}
}
