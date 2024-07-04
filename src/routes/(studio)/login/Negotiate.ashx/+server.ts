import { text, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, cookies }) => {
	cookies.set('.ROBLOSECURITY', url.searchParams.get('suggest') ?? '', {
		path: '/',
		expires: new Date(new Date().getTime() + 1209600000),
		sameSite: 'lax',
		secure: false
	})

	return text(url.searchParams.get('suggest') ?? '') // 1: logged in null: logged out
}
