import { json, type RequestHandler } from "@sveltejs/kit"


export const GET: RequestHandler = async ({locals}) => {
	const config = locals.config

	return json({ success: true, message: '', data: { clicker: config[0].pageClicker } })
}