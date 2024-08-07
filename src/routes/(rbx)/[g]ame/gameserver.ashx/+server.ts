import { text, type RequestHandler } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import script from './gameserver.lua?raw'
import { createSign } from 'node:crypto'

const scriptNew: string = script.replaceAll('www.roblox.com', env.BASE_URL as string)

export const GET: RequestHandler = async ({ url }) => {
	const scriptNewArgs = scriptNew.replace(
		'{1}',
		`"apikey=${url.searchParams.get('apikey')}", ${url.searchParams.get('placeId')}, ${url.searchParams.get('port')}, "${url.searchParams.get('jobId')}", ${url.searchParams.get('maxPlayers')}`
	)

	const sign = createSign('SHA1')
	sign.update('\r\n' + scriptNewArgs)
	const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

	return text('--rbxsig%' + signature + '%\r\n' + scriptNewArgs)
}
