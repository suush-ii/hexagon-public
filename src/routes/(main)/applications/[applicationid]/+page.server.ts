import { error, fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { db } from '$lib/server/db'
import { and, eq, isNull } from 'drizzle-orm'
import { applicationsTable, usersTable } from '$lib/server/schema'
import { getOAuthTokens, getOAuthUrl, getUserData } from '$lib/server/discord'
import { formSchemaDiscord } from '$lib/schemas/settingsschema'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { z } from 'zod'
const limiter = new RateLimiter({
	IP: [1, '2s']
})

export const load: PageServerLoad = async (event) => {
	const { params } = event

	const applicationid = await z.string().uuid().safeParseAsync(params.applicationid)

	if (!applicationid.success) {
		return redirect(302, '/applications')
	}

	if (await limiter.isLimited(event)) {
		return error(429, { success: false, message: 'You are submitting too fast!' })
	}

	const application = await db.query.applicationsTable.findFirst({
		where: eq(applicationsTable.applicationid, params.applicationid),
		columns: {
			created: true,
			reviewed: true,
			discordid: true,
			accepted: true,
			used: true
		}
	})

	if (!application) {
		return redirect(302, '/applications')
	}

	if (application.used === true) {
		return redirect(302, '/')
	}

	return {
		form: await superValidate(zod(formSchemaDiscord)),
		discordAuth: getOAuthUrl(),
		discordid: application.discordid,
		accepted: application.accepted,
		reviewed: application.reviewed,
		applicationid: params.applicationid
	}
}

export const actions: Actions = {
	link: async (event) => {
		const form = await superValidate(event, zod(formSchemaDiscord))
		const { params } = event

		const discordId = await db.query.usersTable.findFirst({
			where: eq(usersTable.discordid, form.data.code),
			columns: {
				discordid: true
			}
		})

		if (discordId?.discordid) {
			return redirect(302, `/applications/${params.applicationid}`)
		}

		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const code = form.data.code

		const tokens = await getOAuthTokens(code).catch((_) => false)
		if (!tokens) {
			return fail(400, {
				form
			})
		}

		const userData = await getUserData(tokens).catch((_) => false)

		if (!userData) {
			return fail(400, {
				form
			})
		}

		const milliseconds = BigInt(userData.user.id) >> 22n
		const accountCreationDate = new Date(Number(milliseconds) + 1420070400000)
		const oneMonthAgo = Date.now() - 1000 * 60 * 60 * 24 * 7 * 4

		if (accountCreationDate.getTime() > oneMonthAgo) {
			// 1 month
			return fail(400, {
				form
			})
		}

		const currentApplication = await db.query.applicationsTable.findFirst({
			where: and(
				eq(applicationsTable.discordid, userData.user.id),
				isNull(applicationsTable.reviewed)
			),
			columns: { accepted: true }
		})

		if (currentApplication) {
			return message(form, 'You already submitted a pending application!')
		}

		const submittedApplications = await db.query.applicationsTable.findMany({
			where: eq(applicationsTable.discordid, userData.user.id),
			columns: { accepted: true }
		})

		if (submittedApplications.length >= 3) {
			return message(form, 'You have reached the maximum amount of applications!')
		}

		await db
			.update(applicationsTable)
			.set({ discordid: userData.user.id })
			.where(eq(applicationsTable.applicationid, params.applicationid))

		return redirect(302, `/applications/${params.applicationid}`)
	}
}
