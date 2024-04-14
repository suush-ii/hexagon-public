import { text, type RequestHandler } from '@sveltejs/kit'
import script from '../studio.ashx/studio.lua?raw'
import { BASE_URL, CLIENT_PRIVATE_KEY } from '$env/static/private'
import { createSign } from 'node:crypto'

const scriptNew: string = script.replaceAll('www.roblox.com', BASE_URL)

export const GET: RequestHandler = async () => {
	const sign = createSign('SHA1')
	sign.update('\r\n' + scriptNew)
	const signature = sign.sign(CLIENT_PRIVATE_KEY, 'base64')

	return text('--rbxsig%' + signature + '%\r\n' + scriptNew)
}
