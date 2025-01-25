import { error, text, type RequestHandler } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import script from './gameserver.lua?raw'
import script2013 from './gameserver.lua?raw'
import scriptDefault from './gameserver_studio.lua?raw'
import { createSign } from 'node:crypto'
import * as jose from 'jose'

const scriptNew: string = script.replaceAll('roblox.com', env.BASE_URL as string)
const script2013New: string = script2013.replaceAll('roblox.com', env.BASE_URL as string)

export const GET: RequestHandler = async ({ url }) => {
	const accessKey = url.searchParams.get('apikey')

	try {
		await jose.jwtVerify(accessKey ?? '', new TextEncoder().encode(env.RCC_ACCESS_KEY as string))
	} catch (e) {
		if (!accessKey || (env.RCC_ACCESS_KEY as string) != accessKey) {
			const sign = createSign('SHA1')
			sign.update('\r\n' + scriptDefault)
			const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

			return text('--rbxsig%' + signature + '%\r\n' + scriptDefault)
		}
	}

	if (url.searchParams.get('version') === '2013') {
		const scriptNew2013Args = script2013New.replace(
			'{1}',
			`"apikey=${url.searchParams.get('apikey')}", ${url.searchParams.get('placeId')}, ${url.searchParams.get('port')}, "${url.searchParams.get('jobId')}", ${url.searchParams.get('maxPlayers')}`
		)

		const sign = createSign('SHA1')
		sign.update('\r\n' + scriptNew2013Args)
		const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

		return text('--rbxsig%' + signature + '%\r\n' + scriptNew2013Args)
	}

	const scriptNewArgs = scriptNew.replace(
		'{1}',
		`"apikey=${url.searchParams.get('apikey')}", ${url.searchParams.get('placeId')}, ${url.searchParams.get('port')}, "${url.searchParams.get('jobId')}", ${url.searchParams.get('maxPlayers')}`
	)

	const sign = createSign('SHA1')
	sign.update('\r\n' + scriptNewArgs)
	const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

	return text('--rbxsig%' + signature + '%\r\n' + scriptNewArgs)
}
