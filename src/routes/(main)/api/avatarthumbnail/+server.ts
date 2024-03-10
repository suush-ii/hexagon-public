import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { usersTable } from '$src/lib/server/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const avatarSchema = z.object({
	type: z.enum(['headshot', 'avatar']),
	userid: z.coerce.number().int()
})

export const POST: RequestHandler = async ({ request }) => {
	let userid: number
	let type: 'headshot' | 'avatar'
	let result
	try {
		;({ userid, type } = await request.json())
		result = await avatarSchema.safeParseAsync({ type, userid })
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const user = await db.select().from(usersTable).where(eq(usersTable.userid, userid)).limit(1)

	if (user.length === 0) {
		return json({
			success: true,
			message: "This user doesn't exist!",
			data: {}
		})
	}

	if (type === 'avatar') {
		if (!user[0].avatarbody) {
			// we need to generate it
			console.log('ltr')
			
		} else {
			// it does exist return cdn url!
			return json({ success: true, message: '', data: { url: user[0].avatarbody } })
		}
	}

	if (type === 'headshot') {
		if (!user[0].avatarheadshot) {
			// we need to generate it
			
		} else {
			// it does exist return cdn url!
			return json({ success: true, message: '', data: { url: user[0].avatarheadshot } })
		}
	}

	return json({ success: true, message: '', data: { url: '' } }) // we are generating...
}
