import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { configTable } from '$src/lib/server/schema/config'

export const POST: RequestHandler = async () => {
	const configOld = await db.select().from(configTable).limit(1)

	await db.update(configTable).set({ pageClicker: configOld[0].pageClicker + 1 })

	return json({ success: true, message: '', data: { clicker: configOld[0].pageClicker + 1 } })
}
