import { type RequestHandler, text } from '@sveltejs/kit'

//TODO : method IsInGroup && IsFriendsWith

export const GET: RequestHandler = async () => {
	return text('<Value Type="boolean">false</Value>')
}
