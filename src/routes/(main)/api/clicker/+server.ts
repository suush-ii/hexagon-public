import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { configTable } from '$src/lib/server/schema/config'

export const POST: RequestHandler = async ({ locals }) => {
	const configOld = locals.config

	await db.update(configTable).set({ pageClicker: configOld[0].pageClicker + 1 })

	return json({ success: true, message: '', data: { clicker: configOld[0].pageClicker + 1 } })
}

export const GET: RequestHandler = async ({ locals }) => {
	const config = locals.config

	return json({ success: true, message: '', data: { clicker: config[0].pageClicker } })
}
