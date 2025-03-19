import { text, type RequestHandler } from '@sveltejs/kit'
import script from '../studio.ashx/studio.lua?raw'
import _2012script from '../studio.ashx/studio2012.lua?raw'
import { env } from '$env/dynamic/private'
import { signScript } from '$lib/server/signScript'

const scriptNew = script.replaceAll('roblox.com', env.BASE_URL as string)
const _2013scriptNew = _2012script.replaceAll('roblox.com', env.BASE_URL as string)

export const GET: RequestHandler = async ({ request }) => {
	if (request.headers.get('user-agent') === '2012ox/WinInet') {
		return text(await signScript(_2013scriptNew, '2012ox/WinInet'))
	}

	return text(await signScript(scriptNew, request.headers.get('user-agent')))
}
