import { text, type RequestHandler } from '@sveltejs/kit'
import { BASE_URL, CLIENT_PRIVATE_KEY } from '$env/static/private'
import script from '../gameserver.ashx/gameserver.lua?raw'
import { createSign } from 'node:crypto'

let scriptNew: string = script.replaceAll('www.roblox.com', BASE_URL)

export const GET: RequestHandler = async ({ url }) => {
	scriptNew = scriptNew.replace(
		'{1}',
		`"${url.searchParams.get('accessKey')}", ${url.searchParams.get('placeId')}, ${url.searchParams.get('port')}, "${url.searchParams.get('jobId')}"`
	)

	const sign = createSign('SHA1')
	sign.update('\r\n' + scriptNew)
	const signature = sign.sign(CLIENT_PRIVATE_KEY, 'base64')

	return text('--rbxsig%' + signature + '%\r\n' + scriptNew)
}
