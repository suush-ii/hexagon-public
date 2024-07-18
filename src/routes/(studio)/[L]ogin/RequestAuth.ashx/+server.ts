import { error, text, type RequestHandler } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

export const GET: RequestHandler = async ({ cookies }) => {
	const cookie = cookies.get('.ROBLOSECURITY')

	if (!cookie) {
		return error(401, { success: false, message: 'Unauthorized', data: {} })
	}

	return text(`http://${env.BASE_URL}/login/Negotiate.ashx?suggest=${cookie}`)
}
