import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import pagination from './pagination.html?raw'

export const GET: RequestHandler = ({ url }) => {
	return text(pagination)
}
