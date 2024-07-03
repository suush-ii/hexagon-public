import { text, type RequestHandler } from '@sveltejs/kit'
import script from './edit.lua?raw'
import { env } from '$env/dynamic/private'
import { createSign } from 'node:crypto'

const scriptNew: string = script.replaceAll('www.roblox.com', env.BASE_URL as string)

export const GET: RequestHandler = async ({ url }) => {
	let scriptNewArgs = scriptNew

	scriptNewArgs = scriptNewArgs.replaceAll('{PlaceId}', url.searchParams.get('PlaceID') ?? '0')

	const sign = createSign('SHA1')
	sign.update('\r\n' + scriptNewArgs)
	const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

	return text('--rbxsig%' + signature + '%\r\n' + scriptNewArgs)
}
