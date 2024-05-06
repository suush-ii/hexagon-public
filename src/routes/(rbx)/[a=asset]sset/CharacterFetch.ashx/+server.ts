import { error, text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { BASE_URL } from '$env/static/private'
import { inventoryTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { and, eq } from 'drizzle-orm'

const bodyColorsUrl = `http://${BASE_URL}/Asset/BodyColors.ashx`

const assetUrl = `http://${BASE_URL}/Asset/`

const userIdSchema = z.coerce.number().positive()

export const GET: RequestHandler = async ({ url }) => {
	const result = userIdSchema.safeParse(
		url.searchParams.get('userId') ?? url.searchParams.get('userid')
	)

	if (result.success === false) {
		return error(400, { success: false, message: 'Malformed Userid.', data: {} })
	}

	const user = result.data

	const inventoryWearing = await db
		.select({ itemid: inventoryTable.itemid })
		.from(inventoryTable)
		.where(and(eq(inventoryTable.userid, user), eq(inventoryTable.wearing, true)))

	const assets = inventoryWearing.map((item) => `${assetUrl}?id=${item.itemid}`).join(';')

	return text(`${bodyColorsUrl}?userId=${user};${assets}`)
}
