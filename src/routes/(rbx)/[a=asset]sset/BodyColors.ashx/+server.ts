import { error, text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { usersTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import bodyColors from './bodyColors.xml?raw'

const userIdSchema = z.coerce.number().positive()

export const fallback: RequestHandler = async ({ url }) => {
	const result = userIdSchema.safeParse(
		url.searchParams.get('userId') ?? url.searchParams.get('userid')
	)

	if (result.success === false) {
		console.log(result.error)
		return error(400, { success: false, message: 'Malformed Userid.', data: {} })
	}

	const user = await db
		.select({
			headColor: usersTable.headcolor,
			leftArmColor: usersTable.leftarmcolor,
			leftLegColor: usersTable.leftlegcolor,
			rightArmColor: usersTable.rightarmcolor,
			rightLegColor: usersTable.rightlegcolor,
			torsoColor: usersTable.torsocolor
		})
		.from(usersTable)
		.where(eq(usersTable.userid, result.data))
		.limit(1)

	if (user.length === 0) {
		return error(404, { success: false, message: 'User not found.', data: {} })
	}

	let bodyColorsNew = bodyColors

	bodyColorsNew = bodyColorsNew.replace('{0}', user[0].headColor.toString())
	bodyColorsNew = bodyColorsNew.replace('{1}', user[0].leftArmColor.toString())
	bodyColorsNew = bodyColorsNew.replace('{2}', user[0].leftLegColor.toString())
	bodyColorsNew = bodyColorsNew.replace('{3}', user[0].rightArmColor.toString())
	bodyColorsNew = bodyColorsNew.replace('{4}', user[0].rightLegColor.toString())
	bodyColorsNew = bodyColorsNew.replace('{5}', user[0].torsoColor.toString())

	return new Response(bodyColorsNew, {
		headers: {
			'Content-Type': 'application/xml'
		}
	})
}
