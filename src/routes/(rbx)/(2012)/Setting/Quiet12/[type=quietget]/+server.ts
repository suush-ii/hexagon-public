import { type RequestHandler, json } from '@sveltejs/kit'
import _2012 from './2012.json'
export const trailingSlash = 'ignore'

export const GET: RequestHandler = async () => {
	return json(_2012)
}
