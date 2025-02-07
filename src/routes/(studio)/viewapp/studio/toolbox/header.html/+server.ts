import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import header from './header.html?raw'

export const GET: RequestHandler = ({ url }) => {
	return text(header)
}
