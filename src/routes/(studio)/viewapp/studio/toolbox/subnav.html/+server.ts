import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import subnav from './subnav.html?raw'

export const GET: RequestHandler = ({ url }) => {
	return text(subnav)
}
