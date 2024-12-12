import { error, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { gamesTable, jobsTable, placesTable, usersTable } from '$lib/server/schema'
import { env } from '$env/dynamic/private'

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
						creatoruserid: true
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

		const jobs = await db.query.jobsTable.findMany({
			where: eq(jobsTable.placeid, Number(params.gameid)),
			columns: {
				jobid: true,
				players: true
			},
			limit: 10,
			with: {
				associatedplace: {
					columns: {},
					with: {
						associatedgame: {
							columns: {
								active: true,
								universeid: true
							}
						}
					}
				}
			}
		})

		for (const job of jobs) {
			const response = await fetch(
				`http://${env.GAMESERVER_IP}:${env.ARBITER_PORT}/closejob/${job.jobid}/${params.gameid}/2014`
			)

			const result = await response.json()

			if (result.success === false) {
				await db.delete(jobsTable).where(eq(jobsTable.jobid, job.jobid))

				if (job.players && job.players.length > 0) {
					for (const player of job.players) {
						await db
							.update(usersTable)
							.set({ activegame: null })
							.where(eq(usersTable.userid, player))
					}

					const newActive = Math.max(
						Number(job?.associatedplace?.associatedgame?.active) - job.players.length,
						0
					)

					await db
						.update(gamesTable)
						.set({ active: newActive })
						.where(eq(gamesTable.universeid, job?.associatedplace?.associatedgame.universeid ?? 0))
				}
			}
		}

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

		if (locals.user.role !== 'admin' && locals.user.role !== 'owner' && locals.user.role !== 'manager') {
			return error(403, { success: false, message: 'Unauthorized.' })
		}

		await db
			.update(gamesTable)
			.set({ original: game.associatedgame.original ? false : true })
			.where(eq(gamesTable.universeid, game.associatedgame.universeid))
	}
}
