import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { jobsTable, placesTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { eq, and, lt } from 'drizzle-orm'
import { env } from '$env/dynamic/private'
import * as jose from 'jose'
import { RateLimiter } from 'sveltekit-rate-limiter/server'

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
		message: ''
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

			//let characterAppearance =
			//	CharacterAppearance + `?userId=` + locals.user.userid + '&jobId=' + instance.jobid

			//const jwt = await new jose.SignJWT({
			//	username: locals.user.username,
			//	userId: locals.user.userid,
			//	jobId: instance.jobid,
			//	membershipType: 'None',
			//	characterAppearance
			//})
			//	.setProtectedHeader({ alg })
			//	.setIssuedAt()
			//	.setExpirationTime('1min')
			//	.sign(secret)

			//placeLauncherJson.authenticationTicket = jwt

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
					universeid: true
				}
			}
		}
	})

	if (!place) {
		throw json({ success: false, message: 'Game not found.', data: {} })
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
			await db.delete(jobsTable).where(eq(jobsTable.jobid, instance.jobid))
		} else {
			placeLauncherJson.status = instance.status
			placeLauncherJson.jobId = instance.jobid
			placeLauncherJson.joinScriptUrl += '?auth=' + authBearer + '&jobid=' + instance.jobid

			//let characterAppearance =
			//	CharacterAppearance + `?userId=` + locals.user.userid + '&jobId=' + instance.jobid

			//const jwt = await new jose.SignJWT({
			//	username: locals.user.username,
			//	userId: locals.user.userid,
			//	jobId: instance.jobid,
			//	membershipType: 'None',
			//	characterAppearance
			//})
			//	.setProtectedHeader({ alg })
			//	.setIssuedAt()
			//	.setExpirationTime('1min')
			//	.sign(secret)

			//placeLauncherJson.authenticationTicket = jwt

			return json(placeLauncherJson)
		}
	}

	if (instance && !instance.port) {
		// 2 users at the same time are trying to start a job just send 1
		placeLauncherJson.status = 1
		placeLauncherJson.joinScriptUrl += '?auth=' + authBearer + '&jobid='

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

	const [instanceNew] = await db
		.insert(jobsTable)
		.values({
			placeid: Number(placeid),
			associatedid: place.associatedgame.universeid,
			type: 'game',
			clientversion: '2014',
			status: 1
		})
		.returning({ jobid: jobsTable.jobid })

	placeLauncherJson.joinScriptUrl += '?auth=' + authBearer + '&jobid=' + instanceNew.jobid
	placeLauncherJson.jobId = instanceNew.jobid
	placeLauncherJson.status = 1

	const response = await fetch(
		`http://${env.GAMESERVER_IP}:${env.ARBITER_PORT}/opengame2014/${instanceNew.jobid}/${Number(placeid)}/${place.associatedgame.serversize}`
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
}
