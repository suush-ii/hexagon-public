import { text, type RequestHandler } from '@sveltejs/kit'
import script from '../studio.ashx/studio.lua?raw'
import { env } from '$env/dynamic/private'
import { createSign } from 'node:crypto'

const scriptNew: string = script.replaceAll('www.roblox.com', env.BASE_URL as string)

export const GET: RequestHandler = async () => {
	const sign = createSign('SHA1')
	sign.update('\r\n' + scriptNew)
	const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

	return text('--rbxsig%' + signature + '%\r\n' + scriptNew)
}
