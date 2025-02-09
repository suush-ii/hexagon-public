import { error, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { gamesTable, placesTable } from '$lib/server/schema'
import { shutdown } from '$lib/server/games/shutdown'

const limiter = new RateLimiter({
	IP: [1, '30s']
})

export const actions: Actions = {
	shutdown: async (event) => {
		const { params, locals } = event

		if (await limiter.isLimited(event)) {
			return error(429, { success: false, message: 'Rate limited.' })
		}

		const game = await db.query.placesTable.findFirst({
			where: eq(placesTable.placeid, Number(params.gameid)),
			columns: {},
			with: {
				associatedgame: {
					columns: {
						creatoruserid: true,
						universeid: true
					}
				}
			}
		})

		if (!game) {
			return error(404, { success: false, message: 'Game not found.' })
		}

		if (
			game.associatedgame.creatoruserid != locals.user.userid &&
			locals.user.role !== 'admin' &&
			locals.user.role !== 'manager' &&
			locals.user.role !== 'owner'
		) {
			return error(403, { success: false, message: 'Unauthorized.' })
		}

		await shutdown(game.associatedgame.universeid)

		return redirect(302, `/games/${params.gameid}/${params.game}`)
	},
	originalgame: async (event) => {
		const { params, locals } = event

		const game = await db.query.placesTable.findFirst({
			where: eq(placesTable.placeid, Number(params.gameid)),
			columns: {},
			with: {
				associatedgame: {
					columns: {
						original: true,
						universeid: true
					}
				}
			}
		})

		if (!game) {
			return error(404, { success: false, message: 'Game not found.' })
		}

		if (
			locals.user.role !== 'admin' &&
			locals.user.role !== 'owner' &&
			locals.user.role !== 'manager'
		) {
			return error(403, { success: false, message: 'Unauthorized.' })
		}

		await db
			.update(gamesTable)
			.set({ original: game.associatedgame.original ? false : true })
			.where(eq(gamesTable.universeid, game.associatedgame.universeid))
	}
}
