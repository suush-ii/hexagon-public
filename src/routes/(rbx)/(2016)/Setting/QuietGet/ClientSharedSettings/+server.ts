import { type RequestHandler, json } from '@sveltejs/kit'
import _2016 from '../ClientAppSettings/2016.json'

export const GET: RequestHandler = async () => {
	return json(_2016)
}
