import { db } from '$lib/server/db'
import { usersTable } from '$lib/server/schema'
import { type RequestHandler, redirect, error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { s3Url } from '$src/stores'
import { z } from 'zod'
const Key = 'thumbnails'
const assetSchema = z.number().int().positive()

export const GET: RequestHandler = async ({ url }) => {
	const result = await assetSchema.safeParseAsync(
		Number(url.searchParams.get('userId') ?? url.searchParams.get('UserID'))
	)

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const userId = result.data

	const [user] = await db
		.select({
			avatarbody: usersTable.avatarbody,
			_3dmanifest: usersTable._3dmanifest,
			avatarheadshot: usersTable.avatarheadshot,
			pose: usersTable.pose
		})
		.from(usersTable)
		.where(eq(usersTable.userid, userId))
		.limit(1)

	if (!user) {
		error(404, { success: false, message: 'User not found.', data: {} })
	}

	if (user?.avatarbody) {
		return redirect(302, `https://${s3Url}/${Key}/${user?.avatarbody}`)
	}

	return redirect(302, '/Images/iconplaceholder.png')
}
