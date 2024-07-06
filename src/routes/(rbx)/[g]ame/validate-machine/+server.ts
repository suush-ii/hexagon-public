import { auth } from '$lib/server/lucia'
import { type RequestHandler, json, fail } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'
import { LuciaError } from 'lucia'
import { db } from '$lib/server/db'
import { macAddressesTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'

const formSchema = z.object({
	macAddresses: z.string().max(12).min(12).array()
})

function stringToMac(macStr: string) {
	const macParts = []
	for (let i = 0; i < 6; i++) {
		macParts.push(macStr.substr(2 * i, 2))
	}
	return macParts.join(':')
}

export const POST: RequestHandler = async (event) => {
	const form = await superValidate(event, zod(formSchema))
	if (
		!form.valid ||
		event.request.headers.get('user-agent') !== 'Roblox/WinInet' ||
		!event.request.headers.get('roblox-place-id')
	) {
		return json({ success: true, message: '' })
	}

	let session

	try {
		const sessionVal = await auth.validateSession(event.cookies.get('.ROBLOSECURITY') ?? '') // this is a hack cuz idk why hooks doens't want to do post requests...

		if (sessionVal) {
			session = sessionVal.user
		}
	} catch {}

	if (session) {
		for (const [_, address] of form.data.macAddresses.entries()) {
			const macAddress = stringToMac(address)

			const [data] = await db
				.select({ banned: macAddressesTable.banned })
				.from(macAddressesTable)
				.where(eq(macAddressesTable.macAddress, macAddress))
				.limit(1)

			if (data?.banned === true) {
				// hwid banned
				return json({ success: false, message: '' })
			}

			if (!data) {
				await db
					.insert(macAddressesTable)
					.values({
						macAddress,
						userid: session.userid
					})
					.onConflictDoNothing()
			}
		}
	}

	return json({ success: true, message: '' })
}
