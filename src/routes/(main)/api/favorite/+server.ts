import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { assetFavoritesTable } from '$lib/server/schema'
import { assetTable } from '$lib/server/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const favoriteSchema = z.object({
	assetid: z.coerce.number().int()
})

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	let assetid: number
	let result
	try {
		;({ assetid } = await request.json())
		result = await favoriteSchema.safeParseAsync({ assetid })
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const asset = await db.select({}).from(assetTable).where(eq(assetTable.assetid, assetid)).limit(1)

	if (asset.length === 0) {
		return json({
			success: true,
			message: "This asset doesn't exist!",
			data: {}
		})
	}

	const existingFavorite = await db
		.select({})
		.from(assetFavoritesTable)
		.where(
			and(eq(assetFavoritesTable.userid, user.userid), eq(assetFavoritesTable.assetid, assetid))
		)
		.limit(1)

	if (existingFavorite.length !== 0) {
		//unfavorite
		await db
			.delete(assetFavoritesTable)
			.where(
				and(eq(assetFavoritesTable.userid, user.userid), eq(assetFavoritesTable.assetid, assetid))
			)

		return json({ success: true, message: 'Item unfavorited!', data: {} })
	} else {
		//favorite

		await db.insert(assetFavoritesTable).values({ userid: user.userid, assetid: assetid })

		return json({ success: true, message: 'Item favorited!', data: {} })
	}
}
