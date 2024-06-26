import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'

const joinScriptUrl = `http://${env.BASE_URL}/game/Join2.ashx`
const authenticationUrl = `http://${env.BASE_URL}/Login/Negotiate.ashx`

/*export const fallback: RequestHandler = async () => {
	let placeLauncherJson = {
		jobId: '',
		status: 2,
		joinScriptUrl,
		authenticationUrl,
		authenticationTicket: 'ticket',
		message: ''
	}

	return json(placeLauncherJson)
}
*/
