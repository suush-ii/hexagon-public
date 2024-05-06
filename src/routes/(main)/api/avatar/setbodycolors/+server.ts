import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { z } from 'zod'
import { usersTable } from '$src/lib/server/schema'
import { eq } from 'drizzle-orm'

const bodyColorsSchema = z.object({
	headColor: z.coerce.number(),
	leftArmColor: z.coerce.number(),
	leftLegColor: z.coerce.number(),
	rightArmColor: z.coerce.number(),
	rightLegColor: z.coerce.number(),
	torsoColor: z.coerce.number()
})

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	let result
	try {
		const bodycolors = await request.json()
		result = await bodyColorsSchema.safeParseAsync(bodycolors.colors)
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	await db
		.update(usersTable)
		.set({
			headcolor: result.data.headColor,
			leftarmcolor: result.data.leftArmColor,
			leftlegcolor: result.data.leftLegColor,
			rightarmcolor: result.data.rightArmColor,
			rightlegcolor: result.data.rightLegColor,
			torsocolor: result.data.torsoColor,
			avatarbody: null,
			avatarheadshot: null,
			_3dmanifest: null
		})
		.where(eq(usersTable.userid, user.userid))

	return json({ success: true, message: 'Body colors updated.', data: {} })
}
