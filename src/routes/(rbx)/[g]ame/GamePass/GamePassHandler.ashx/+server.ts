import { text, type RequestHandler } from '@sveltejs/kit'

export const fallback: RequestHandler = async (event) => {
	return text('<Value Type="boolean">false</Value>')
}
