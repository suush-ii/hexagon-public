import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import thumbnail from './thumbnail.html?raw'

export const GET: RequestHandler = ({ url }) => {
	return text(thumbnail)
}
