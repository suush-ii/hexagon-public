import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { BASE_URL } from '$env/static/private'

const joinScriptUrl = `http://${BASE_URL}/game/Join2.ashx`
const authenticationUrl = `http://${BASE_URL}/Login/Negotiate.ashx`

export const fallback: RequestHandler = async () => {
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
