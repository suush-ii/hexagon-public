import { text, type RequestHandler } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

export const GET: RequestHandler = async () => {
	return text(`http://${env.BASE_URL}/login/Negotiate.ashx`) // 1: logged in null: logged out
}
