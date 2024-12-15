import { db } from '$src/lib/server/db'
import { usersTable } from '$src/lib/server/schema'
import { s3Url } from '$src/stores'
import { type RequestHandler, json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
const Key = 'thumbnails'

export const GET: RequestHandler = async ({ locals }) => {
	const render = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, locals.user.userid),
		columns: {
			avatarheadshot: true
		}
	})

	if (!render) {
		return json({
			Status: 'BadRequest',
			UserInfo: {}
		})
	}

	return json({
		Status: 'OK',
		UserInfo: {
			UserID: Number(locals.user.userid),
			UserName: locals.user.username,
			RobuxBalance: Number(locals.user.coins),
			TicketsBalance: 0,
			IsAnyBuildersClubMember: false,
			ThumbnailUrl: render.avatarheadshot ? `https://${s3Url}/${Key}/${render.avatarheadshot}` : ''
		}
	})
}
