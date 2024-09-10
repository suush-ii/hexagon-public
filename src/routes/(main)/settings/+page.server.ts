import type { PageServerLoad, Actions } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { formSchema, formSchemaDiscord } from '$lib/schemas/settingsschema'
import { zod } from 'sveltekit-superforms/adapters'
import { fail } from 'sveltekit-superforms'
import { db } from '$lib/server/db'
import { usersTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { getOAuthTokens, getOAuthUrl, getUserData, pushMetadata } from '$lib/server/discord'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
	const blurb = await db
		.select({ blurb: usersTable.blurb })
		.from(usersTable)
		.where(eq(usersTable.userid, locals.user.userid))
		.limit(1)

	const discordId = await db.query.usersTable.findFirst({
		columns: {
			discordid: true
		},
		where: eq(usersTable.userid, locals.user.userid)
	})

	return {
		form: await superValidate(zod(formSchema)),
		blurb: blurb[0].blurb,
		discordAuth: getOAuthUrl(),
		discordId: discordId?.discordid
	}
}

export const actions: Actions = {
	other: async (event) => {
		const form = await superValidate(event, zod(formSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { blurb } = form.data

		await db
			.update(usersTable)
			.set({ blurb })
			.where(eq(usersTable.userid, event.locals.user.userid))
	},
	link: async (event) => {
		const form = await superValidate(event, zod(formSchemaDiscord))
		const { locals } = event

		const discordId = await db.query.usersTable.findFirst({
			columns: {
				discordid: true
			},
			where: eq(usersTable.userid, locals.user.userid)
		})

		if (discordId?.discordid) {
			return redirect(302, '/settings')
		}

		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const code = form.data.code

		const tokens = await getOAuthTokens(code)
		if (!tokens) {
			return fail(400, {
				form
			})
		}

		const userData = await getUserData(tokens)

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

		await db
			.update(usersTable)
			.set({ discordid: userData.user.id })
			.where(eq(usersTable.userid, locals.user.userid))

		await pushMetadata(userData.user.id, tokens, { has_account: 1 })

		return redirect(302, '/settings')
	}
}
