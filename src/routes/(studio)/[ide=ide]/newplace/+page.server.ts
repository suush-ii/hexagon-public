import type { PageServerLoad, Actions } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
export const csr = false
import { env } from '$env/dynamic/private'
import { error, redirect } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { assetTable, gamesTable, placesTable } from '$src/lib/server/schema'
import { z } from 'zod'
import { formSchema as placeSchema } from '$lib/schemas/gameschema'

const { shape } = placeSchema

const idePlaceSchema = z.object({
	Name: shape.name,
	Description: shape.description,
	Genre: shape.genre
})

export const load: PageServerLoad = async () => {
	return {
		baseurl: env.BASE_URL
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(idePlaceSchema))
		if (!form.valid) {
			return error(400, { success: false, message: 'invalid form', data: {} })
		}

		const user = event.locals.user

		if (!user) {
			error(401, { success: false, message: 'No session.', data: {} })
		}

		const { Name, Description, Genre } = form.data

		const placeResponse = await db.transaction(async (tx) => {
			try {
				const [gameResponse] = await tx
					.insert(gamesTable)
					.values({
						description: Description,
						creatoruserid: user.userid,
						genre: Genre,
						serversize: 20
					})
					.returning({ universeid: gamesTable.universeid })

				const [assetResponse] = await tx
					.insert(assetTable)
					.values({
						assetname: Name,
						assetType: 'games',
						creatoruserid: user.userid,
						moderationstate: 'approved'
					})
					.returning({ assetid: assetTable.assetid })

				await tx.insert(placesTable).values({
					placeid: assetResponse.assetid,
					universeid: gameResponse.universeid,
					placeurl: null,
					startplace: true,
					placename: Name
				})

				return assetResponse
			} catch {
				tx.rollback()
				return error(500, {
					success: false,
					message: 'Internal server error.',
					data: {}
				})
			}
		})

		return redirect(302, `/ide/publishing?PlaceID=${placeResponse.assetid}`)
	}
}
