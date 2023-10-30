import { text, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url }) => {
	return text(url.searchParams.get('suggest') ?? '') // 1: logged in null: logged out
}
