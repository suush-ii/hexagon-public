import { env } from '$env/dynamic/private'
import { type RequestHandler, text } from '@sveltejs/kit'
import { createSign } from 'node:crypto'
import { gamesessionsTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { eq, and } from 'drizzle-orm'

export const GET: RequestHandler = async ({ url }) => {
	const username = url.searchParams.get('Username')
	const userid = url.searchParams.get('UserID')
	const ticket = url.searchParams.get('Ticket')
	const jobId = url.searchParams.get('JobID')
	const placeId = url.searchParams.get('PlaceID')
	const membershipType = url.searchParams.get('MembershipType')
	const CharacterAppearance =
		url.searchParams.get('CharacterAppearance') + `&jobId=${jobId}` + `&placeId=${placeId}`

	const timestamp = ticket?.split(';')?.[0] ?? ''

	const givensig1 = ticket?.split(';')?.[1] ?? ''

	const givensig2 = ticket?.split(';')?.[2] ?? ''

	const sign1 = createSign('SHA1')
	sign1.update(
		`${Number(userid)}\n` /*userid*/ +
			`${username}\n` /*username*/ +
			`${CharacterAppearance}\n` /*charapp*/ +
			`${jobId}\n` /*jobid*/ +
			timestamp /*timestamp*/
	)
	const signature1 = sign1.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

	if (signature1 !== givensig1) {
		return text('False')
	}

	const sign2 = createSign('SHA1')
	sign2.update(`${Number(userid)}\n` /*userid*/ + `${jobId}\n` /*jobid*/ + timestamp /*timestamp*/)
	const signature2 = sign2.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

	if (signature2 !== givensig2) {
		return text('False')
	}

	await db
		.update(gamesessionsTable)
		.set({ active: true, verified: true })
		.where(
			and(eq(gamesessionsTable.jobid, jobId ?? ''), eq(gamesessionsTable.userid, Number(userid)))
		)

	return text('True')
}
