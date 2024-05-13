import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { incrementClicker } from '$lib/server/config'

export const POST: RequestHandler = async ({ locals }) => {
	const configOld = locals.config

	incrementClicker()

	return json({ success: true, message: '', data: { clicker: configOld[0].pageClicker + 1 } })
}

export const GET: RequestHandler = async ({ locals }) => {
	const config = locals.config

	return json({ success: true, message: '', data: { clicker: config[0].pageClicker } })
}
