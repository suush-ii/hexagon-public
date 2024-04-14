import { json, text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { GAMESERVER_IP, BASE_URL, CLIENT_PRIVATE_KEY, JWT_SECRET_KEY } from '$env/static/private'
import { createSign } from 'node:crypto'

import * as jose from 'jose'

const secret = new TextEncoder().encode(JWT_SECRET_KEY)
const alg = 'HS256'

const CharacterAppearance = `http://${BASE_URL}/Asset/CharacterFetch.ashx`
const BaseUrl = `http://${BASE_URL}/`

export const fallback: RequestHandler = async ({ url, locals }) => {
	let joinJson = {
		ClientPort: 0,
		MachineAddress: 'localhost',
		ServerPort: 53640,
		PingUrl: '',
		PingInterval: 120,
		UserName: 'Player',
		SeleniumTestMode: false,
		UserId: 261,
		SuperSafeChat: false,
		CharacterAppearance,
		ClientTicket: 'hello from the other side',
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

	joinJson.MachineAddress = '127.0.0.1'
	joinJson.ServerPort = 53640

	joinJson.UserName = 'Player'
	joinJson.UserId = 1
	joinJson.CharacterAppearance += `?userId=` + 1 + `&jobId=` + 'ca'

	joinJson.GameId = 1
	joinJson.PlaceId = 1818

	joinJson.CreatorId = 1
	joinJson.SessionId = ''
	joinJson.UniverseId = 1

	const jwt = await new jose.SignJWT({
		username: 'username',
		userId: 3,
		jobId: 'ass',
		membershipType: 'None',
		characterAppearance: CharacterAppearance
	})
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setExpirationTime('1min')
		.sign(secret)

	console.log(jwt)

	const sign = createSign('SHA1')
	sign.update('\r\n' + JSON.stringify(joinJson))

	const signature = sign.sign(CLIENT_PRIVATE_KEY, 'base64')

	return text('--rbxsig%' + signature + '%\r\n' + JSON.stringify(joinJson))
}
