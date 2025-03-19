import { env } from '$env/dynamic/private'
import { createSign } from 'node:crypto'

export async function signScript(script: string, userAgent: string | null) {
	const sign = createSign('SHA1')
	sign.update('\r\n' + script)
	const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

	let header = userAgent === '2012ox/WinInet' ? '%' : '--rbxsig%'

	return header + signature + '%\r\n' + script
}
