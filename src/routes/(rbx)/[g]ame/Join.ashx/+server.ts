import { json, text, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { jobsTable, placesTable, usersTable, gamesessionsTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { eq, and } from 'drizzle-orm'
import { env } from '$env/dynamic/private'
import { auth } from '$lib/server/lucia'
import { LuciaError } from 'lucia'
import { z } from 'zod'
import { createSign } from 'node:crypto'
import script from './join.lua?raw'

const scriptNew: string = script.replaceAll('roblox.com', env.BASE_URL as string)

const CharacterAppearance = `http://www.${env.BASE_URL}/Asset/CharacterFetch.ashx`
const BaseUrl = `http://${env.BASE_URL}/`

export const fallback: RequestHandler = async ({ url, locals }) => {
	// capture get/post
	const jobid = url.searchParams.get('jobid')
	const authBearer = url.searchParams.get('auth') ?? ''

	const result = await z.string().uuid().safeParseAsync(jobid)

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		return error(400, { success: false, message: 'Malformed Job.', data: { errors } })
	}

	let session

	try {
		const sessionVal = await auth.validateSession(authBearer)

		if (sessionVal) {
			session = sessionVal.user
		} else {
			return error(403, {
				success: false,
				message: 'Invalid session.',
				data: {}
			})
		}
	} catch (e) {
		if (e instanceof LuciaError && e.message === `AUTH_INVALID_SESSION_ID`) {
			// invalid session
			return error(403, {
				success: false,
				message: 'Invalid session.',
				data: {}
			})
		}
	}

	const enabled = locals.config[0].gamesEnabled

	if (!enabled) {
		return error(403, {
			success: false,
			message: 'Games are disabled.',
			data: {}
		})
	}

	if (!jobid) {
		return error(400, {
			success: false,
			message: 'Missing parameters.',
			data: {}
		})
	}

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, session.userid),
		columns: {
			discordid: true
		}
	})

	if (!user?.discordid) {
		return error(401, { success: false, message: 'Please link your discord account.', data: {} })
	}

	const instance = await db.query.jobsTable.findFirst({
		where: and(eq(jobsTable.jobid, jobid), eq(jobsTable.type, 'game'))
	})

	if (!instance) {
		return error(404, {
			success: false,
			message: 'Invalid Jobid',
			data: {}
		})
	}

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, Number(instance.placeid)),
		with: {
			associatedgame: {
				columns: {
					serversize: true,
					universeid: true
				},
				with: {
					author: {
						columns: {
							username: true,
							userid: true
						}
					}
				}
			}
		}
	})

	if (!place) {
		// this shouldn't even be possible?

		return json({
			success: false,
			message: 'Error',
			data: {}
		})
	}

	if (Number(instance.active) >= place.associatedgame.serversize) {
		// job is full
		return json({
			success: false,
			message: 'Job is full.',
			data: {}
		})
	}

	if (instance && (!instance.port || instance.status === 1)) {
		// job is not ready yet?

		return json({
			success: false,
			message: 'Job not ready.',
			data: {}
		})
	}

	if (instance && instance.port && instance.status === 2) {
		// an instance is available\

		const joinJson: { [key: string]: string | number | boolean } = {
			ClientPort: 0,
			MachineAddress: 'localhost',
			ServerPort: 53640,
			PingUrl: '',
			PingInterval: 120,
			UserName: 'Player',
			SeleniumTestMode: false,
			UserId: 0,
			SuperSafeChat: false,
			CharacterAppearance,
			ClientTicket: '',
			GameId: 1,
			PlaceId: 1818,
			MeasurementUrl: '',
			WaitingForCharacterGuid: 'cad99b30-7983-434b-b24c-eac12595e5fd',
			BaseUrl,
			ChatStyle: 'ClassicAndBubble',
			VendorId: 0,
			ScreenShotInfo: '',
			VideoInfo:
				'<?xml version="1.0"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007"><media:group><media:title type="plain"><![CDATA[ROBLOX Place]]></media:title><media:description type="plain"><![CDATA[ For more games visit http://www.roblox.com]]></media:description><media:category scheme="http://gdata.youtube.com/schemas/2007/categories.cat">Games</media:category><media:keywords>ROBLOX, video, free game, online virtual world</media:keywords></media:group></entry>',
			CreatorId: 0,
			CreatorTypeEnum: 'User',
			MembershipType: 'None',
			AccountAge: 365,
			CookieStoreFirstTimePlayKey: 'rbx_evt_ftp',
			CookieStoreFiveMinutePlayKey: 'rbx_evt_fmp',
			CookieStoreEnabled: true,
			IsRobloxPlace: false,
			GenerateTeleportJoin: false,
			IsUnknownOrUnder13: false,
			SessionId:
				'c25fd620-bbaa-4fb2-b022-3f053cdd1abd|00000000-0000-0000-0000-000000000000|0|204.236.226.210|8|2016-08-17T01:05:05.7115837Z|0|null|null|null|null',
			DataCenterId: 0,
			UniverseId: 0,
			BrowserTrackerId: 0,
			UsePortraitMode: false,
			FollowUserId: 0,
			CharacterAppearanceId: 1
		}

		joinJson.MachineAddress = env.GAMESERVER_IP as string
		joinJson.ServerPort = instance.port

		joinJson.UserName = session.username
		joinJson.UserId = Number(session.userid)
		joinJson.CharacterAppearance += `?userId=${session.userid}&jobId=${instance.jobid}&placeId=${instance.placeid}`

		joinJson.GameId = Number(place.associatedgame.universeid)
		joinJson.PlaceId = Number(place.placeid)

		joinJson.CreatorId = place.associatedgame.author.userid
		joinJson.SessionId = `${authBearer}`
		joinJson.UniverseId = Number(place.associatedgame.universeid)

		// client ticket

		const timestamp = Date.now()
		joinJson.ClientTicket = timestamp + ';' // timestamp

		// a client ticket is composed of 2 signatures

		const sign1 = createSign('SHA1')
		sign1.update(
			`${Number(session.userid)}\n` /*userid*/ +
				`${session.username}\n` /*username*/ +
				`${joinJson.CharacterAppearance}\n` /*charapp*/ +
				`${instance.jobid}\n` /*jobid*/ +
				timestamp /*timestamp*/
		)
		const signature1 = sign1.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')
		joinJson.ClientTicket += signature1 + ';'

		const sign2 = createSign('SHA1')
		sign2.update(
			`${Number(session.userid)}\n` /*userid*/ +
				`${instance.jobid}\n` /*jobid*/ +
				timestamp /*timestamp*/
		)
		const signature2 = sign2.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')
		joinJson.ClientTicket += signature2

		// joinscript signature

		let scriptNewArgs = scriptNew

		for (const key in joinJson) {
			scriptNewArgs = scriptNewArgs.replaceAll(`{${key}}`, joinJson[key].toString())
		}

		const sign = createSign('SHA1')
		sign.update('\r\n' + scriptNewArgs)
		const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

		await db.insert(gamesessionsTable).values({
			jobid: instance.jobid,
			placeid: place.placeid,
			userid: Number(session.userid)
		})

		return text('--rbxsig%' + signature + '%\r\n' + scriptNewArgs)
	}

	return json({})
}
