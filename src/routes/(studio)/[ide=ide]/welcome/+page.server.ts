import { auth } from '$lib/server/lucia'
import { db } from '$lib/server/db'
import type { PageServerLoad } from './$types'
import { gamesTable, placesTable } from '$lib/server/schema'
import { desc, eq } from 'drizzle-orm'
export const csr = false

export const load: PageServerLoad = async (event) => {
	const filepath = event.url.searchParams.getAll('filepath')
	const filename = event.url.searchParams.getAll('filename')

	const files: { [key: string]: string } = {}
	for (let i = 0; i < filepath.length; i++) {
		files[filepath[i] || 'defaultPath'] = filename[i] || 'defaultName'
	}

	event.locals.auth = auth.handleRequest(event)

	const session = await event.locals.auth.validate()

	if (session?.user) {
		event.locals.user = session.user

		const gamecreations = await db.query.gamesTable.findMany({
			where: eq(gamesTable.creatoruserid, event.locals.user.userid),
			orderBy: desc(gamesTable.updated),
			limit: 10,
			columns: {
				gamename: true,
				thumbnailid: true
			},
			with: {
				places: {
					columns: {
						placeid: true
					},
					where: eq(placesTable.startplace, true),
					limit: 1
				}
			}
		})

		return {
			files,
			username: event.locals.user.username,
			gamecreations
		}
	}

	return {
		files
	}
}
