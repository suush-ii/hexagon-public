import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return json({
		data: [
			'0.178.0pcplayer',
			'0.176.0pcplayer',
			'2.183.0androidapp',
			'INTERNALandroidapp',
			'INTERNAiosapp'
		]
	})
}
