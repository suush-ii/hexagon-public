import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import assets from './assets.html?raw'

export const GET: RequestHandler = ({ url }) => {
	return text(assets)
}
