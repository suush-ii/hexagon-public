import { type RequestHandler, json } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema } from '$src/lib/schemas/loginschema'
import { auth } from '$src/lib/server/lucia'
import { LuciaError } from 'lucia'
import { db } from '$src/lib/server/db'
import { eq } from 'drizzle-orm'
import { usersTable } from '$src/lib/server/schema'
import { s3Url } from '$src/stores'
const Key = 'thumbnails'

export const POST: RequestHandler = async (event) => {
	const form = await superValidate(event, zod(formSchema))
	if (!form.valid) {
		return json({
			Status: 'BadRequest',
			UserInfo: {}
		})
	}
	const { username, password } = form.data

	let session_new

	try {
		const user = await auth.useKey(
			'username',
			username.toString().toLowerCase(),
			password.toString()
		)
		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		})
		const sessionCookie = auth.createSessionCookie(session)

		const path = sessionCookie.attributes.path || '/'

		sessionCookie.attributes.secure = false // allow on http

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			...sessionCookie.attributes,
			path
		}) // set session cookie

		session_new = session
	} catch (e) {
		if (
			e instanceof LuciaError &&
			(e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
		) {
			return json({
				Status: 'InvalidPassword',
				UserInfo: {}
			})
		}

		return json({
			Status: 'BadRequest',
			UserInfo: {}
		})
	}

	const render = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, session_new.user.userid),
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
			UserID: Number(session_new.user.userid),
			UserName: session_new.user.username,
			RobuxBalance: Number(session_new.user.coins),
			TicketsBalance: 0,
			IsAnyBuildersClubMember: false,
			ThumbnailUrl: render.avatarheadshot ? `https://${s3Url}/${Key}/${render.avatarheadshot}` : ''
		}
	})
}
