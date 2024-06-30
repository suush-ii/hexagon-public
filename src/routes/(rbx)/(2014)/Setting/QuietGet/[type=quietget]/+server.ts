import { type RequestHandler, json } from '@sveltejs/kit'
import _2014 from './2014.json'
export const trailingSlash = 'ignore'

export const GET: RequestHandler = async () => {
	return json(_2014)
}
