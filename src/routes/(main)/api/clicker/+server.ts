import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { incrementClicker } from '$lib/server/config'
import { RateLimiter } from 'sveltekit-rate-limiter/server'

const limiter = new RateLimiter({
	IP: [1, '10s']
})

export const POST: RequestHandler = async (event) => {
	const configOld = event.locals.config

	if (await limiter.isLimited(event)) {
		return error(429, { success: false, message: '', data: { clicker: configOld[0].pageClicker } })
	}

	incrementClicker()

	return json({ success: true, message: '', data: { clicker: configOld[0].pageClicker + 1 } })
}

export const GET: RequestHandler = async ({ locals }) => {
	const config = locals.config

	return json({ success: true, message: '', data: { clicker: config[0].pageClicker } })
}
