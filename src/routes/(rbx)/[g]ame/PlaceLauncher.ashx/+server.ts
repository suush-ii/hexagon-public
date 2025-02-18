import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { jobsTable, placesTable, usersTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { eq, and, lt } from 'drizzle-orm'
import { env } from '$env/dynamic/private'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { deleteJob } from '$lib/games/deleteJob'
import * as jose from 'jose'

const limiter = new RateLimiter({
	IP: [2, '10s']
})

const secret = new TextEncoder().encode(env.JWT_SECRET_KEY)
const alg = 'HS256'

const joinScriptUrl = `http://${env.BASE_URL}/game/Join.ashx`
const authenticationUrl = `http://${env.BASE_URL}/Login/Negotiate.ashx`
const CharacterAppearance = `http://${env.BASE_URL}/Asset/CharacterFetch.ashx`

export const fallback: RequestHandler = async (event) => {
	// capture get/post
	const { url, locals, fetch, cookies } = event

	const placeid = url.searchParams.get('placeid') ?? url.searchParams.get('placeId')
	const jobid = url.searchParams.get('jobid') ?? url.searchParams.get('jobId')
	const authBearer = cookies.get('.ROBLOSECURITY')

	const placeLauncherJson = {
		jobId: '',
		status: 2,
		joinScriptUrl,
		authenticationUrl,
		authenticationTicket: authBearer,
		message: '',
		version: '2014'
	}

	const enabled = locals.config[0].gamesEnabled

	if (!enabled) {
		return error(403, {
			success: false,
			message: 'Games are disabled.',
			data: {}
		})
	}

	if (!placeid && !jobid) {
		return error(400, {
			success: false,
			message: 'Missing parameters.',
			data: {}
		})
	}

	if (jobid) {
		const instance = await db.query.jobsTable.findFirst({
			where: and(eq(jobsTable.jobid, jobid), eq(jobsTable.type, 'game'))
		})

		if (!instance) {
			return error(404, {
				success: false,
				message: 'Job not found.',
				data: {}
			})
		}

		if (instance && (instance.status === 1 || instance.status === 2)) {
			placeLauncherJson.status = instance.status
			placeLauncherJson.jobId = instance.jobid
			placeLauncherJson.joinScriptUrl += '?auth=' + authBearer + '&jobid=' + instance.jobid
			placeLauncherJson.version = instance.clientversion

			return json(placeLauncherJson)
		}
	}

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, Number(placeid)),
		columns: {},
		with: {
			associatedgame: {
				columns: {
					serversize: true,
					universeid: true,
					clientversion: true
				}
			},
			associatedasset: {
				columns: {
					moderationstate: true
				}
			}
		}
	})

	if (!place) {
		return error(404, { success: false, message: 'Game not found.', data: {} })
	}

	if (place.associatedasset.moderationstate !== 'approved') {
		return error(401, { success: false, message: 'Game under review. Try again later.', data: {} })
	}

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, locals.user.userid),
		columns: {
			discordid: true
		}
	})

	if (!user?.discordid) {
		return error(401, { success: false, message: 'Please link your discord account.', data: {} })
	}

	const instance = await db.query.jobsTable.findFirst({
		where: and(
			eq(placesTable.placeid, Number(placeid)),
			eq(jobsTable.type, 'game'),
			lt(jobsTable.active, place.associatedgame.serversize) // we only want jobs that aren't full
		)
	})

	if (instance && instance.port && (instance.status === 1 || instance.status === 2)) {
		// an instance is already available or is loading...

		if (
			(instance.active ?? 0) <= 0 &&
			instance.status === 1 &&
			new Date().valueOf() - instance.created.valueOf() > 5 * 60 * 1000
		) {
			// 5 mins has passed and the instance shows no life?
			// its probably dead also this should probalby not be possible unless the gameserver goes down because windows updates or something LOL
			await deleteJob(instance.jobid, instance.players)
		} else if (
			instance.presenceping &&
			new Date().valueOf() - instance.presenceping.valueOf() > 60 * 1000
		) {
			await deleteJob(instance.jobid, instance.players)
		} else {
			placeLauncherJson.status = instance.status
			placeLauncherJson.jobId = instance.jobid
			placeLauncherJson.joinScriptUrl += '?auth=' + authBearer + '&jobid=' + instance.jobid
			placeLauncherJson.version = instance.clientversion

			return json(placeLauncherJson)
		}
	}

	if (instance && !instance.port) {
		// 2 users at the same time are trying to start a job just send 1
		placeLauncherJson.status = 1
		placeLauncherJson.joinScriptUrl += '?auth=' + authBearer + '&jobid='
		placeLauncherJson.version = instance.clientversion

		return json(placeLauncherJson)
	}

	// create a new instance

	if (await limiter.isLimited(event)) {
		return error(429, {
			success: false,
			message: 'Your launching games too fast!',
			data: {}
		})
	}

	const clientversion = place.associatedgame.clientversion

	placeLauncherJson.version = clientversion

	const [instanceNew] = await db
		.insert(jobsTable)
		.values({
			placeid: Number(placeid),
			associatedid: place.associatedgame.universeid,
			type: 'game',
			clientversion,
			status: 1
		})
		.returning({ jobid: jobsTable.jobid })

	placeLauncherJson.joinScriptUrl += '?auth=' + authBearer + '&jobid=' + instanceNew.jobid
	placeLauncherJson.jobId = instanceNew.jobid
	placeLauncherJson.status = 1
	try {
		const secret = new TextEncoder().encode(env.ASSET_ACCESS_KEY as string)

		const alg = 'HS256'

		const jwt = await new jose.SignJWT({ jobid: instanceNew.jobid })
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setExpirationTime('1h')
			.sign(secret)

		const response = await fetch(
			`http://${env.ARBITER_HOST}/opengame${clientversion}/${instanceNew.jobid}/${Number(placeid)}/${place.associatedgame.serversize}/${jwt}`
		)
		const gameresponse = await response.json()

		if (gameresponse.success === false) {
			// error maybe retry or something but for now just kill the instance
			await db.delete(jobsTable).where(eq(jobsTable.jobid, instanceNew.jobid))

			return error(400, { success: false, message: 'Error.', data: {} })
		}

		await db
			.update(jobsTable)
			.set({ port: gameresponse.port })
			.where(eq(jobsTable.jobid, instanceNew.jobid))

		return json(placeLauncherJson)
	} catch {
		await db.delete(jobsTable).where(eq(jobsTable.jobid, instanceNew.jobid))

		try {
			await fetch(`http://${env.ARBITER_HOST}/closejob/${instanceNew.jobid}/${placeid}/2014`)
		} catch {}

		return error(500, { success: false, message: 'Failed to start game.', data: {} })
	}
}
