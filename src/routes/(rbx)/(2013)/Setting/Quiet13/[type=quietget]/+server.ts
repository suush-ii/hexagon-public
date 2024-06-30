import { type RequestHandler, json } from '@sveltejs/kit'
import _2013 from './2013.json'
export const trailingSlash = 'ignore'

export const GET: RequestHandler = async () => {
	return json(_2013)
}
