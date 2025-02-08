import type { PageServerLoad, Actions } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { formSchema, formSchemaDiscord } from '$lib/schemas/settingsschema'
import { formSchema as changePasswordSchema } from '$lib/schemas/changepasswordschema'
import { formSchema as _2faSchema } from '$src/lib/schemas/2faenableschema'
import { formSchema as _2faDisableSchema } from '$src/lib/schemas/2faschema'
import { zod } from 'sveltekit-superforms/adapters'
import { fail, setError } from 'sveltekit-superforms'
import { db } from '$lib/server/db'
import { usersTable } from '$lib/server/schema'
import { and, eq, not } from 'drizzle-orm'
import { getOAuthTokens, getOAuthUrl, getUserData, pushMetadata } from '$lib/server/discord'
import { redirect } from '@sveltejs/kit'
import { authenticator } from '@otplib/preset-default'
import { auth } from '$src/lib/server/lucia'
import { LuciaError } from 'lucia'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import qrcode from 'qrcode'

const limiter = new RateLimiter({
	IP: [1, '30s']
})

export const load: PageServerLoad = async ({ locals }) => {
	const blurb = await db
		.select({ blurb: usersTable.blurb })
		.from(usersTable)
		.where(eq(usersTable.userid, locals.user.userid))
		.limit(1)

	const user = await db.query.usersTable.findFirst({
		columns: {
			discordid: true,
			_2fasecret: true
		},
		where: eq(usersTable.userid, locals.user.userid)
	})

	const changePasswordForm = await superValidate(zod(changePasswordSchema))

	const secret = authenticator.generateSecret()

	const otpauth = authenticator.keyuri(locals.user.username, 'Hexagon', secret)

	const url = await qrcode.toDataURL(otpauth)

	return {
		form: await superValidate(zod(formSchema)),
		changePasswordForm,
		blurb: blurb[0].blurb,
		discordAuth: getOAuthUrl(),
		discordId: user?.discordid,
		_2faEnabled: user?._2fasecret ? true : false,
		url,
		secret,
		_2faForm: await superValidate(zod(_2faSchema)),
		_2faDisableForm: await superValidate(zod(_2faDisableSchema))
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

		const discord = await db.query.usersTable.findFirst({
			columns: {
				discordid: true,
				userid: true
			},
			where: and(
				eq(usersTable.discordid, userData.user.id),
				not(eq(usersTable.userid, locals.user.userid))
			)
		})

		if (discord?.discordid && discord.userid != locals.user.userid) {
			return fail(400, {
				form
			})
		}

		if (discordId?.discordid && discordId.discordid != userData.user.id) {
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
	},
	changepassword: async (event) => {
		const form = await superValidate(event, zod(changePasswordSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { locals } = event

		const { newpassword, password } = form.data

		try {
			await auth.useKey('username', locals.user.username.toLowerCase(), password) // validate password too
		} catch (e) {
			if (e instanceof LuciaError && e.message === 'AUTH_INVALID_KEY_ID') {
				return setError(form, 'password', 'Incorrect password')
			}
			if (e instanceof LuciaError && e.message === 'AUTH_INVALID_PASSWORD') {
				return setError(form, 'password', 'Invalid password')
			}

			return fail(400, { form })
		}

		await auth.updateKeyPassword('username', locals.user.username.toLowerCase(), newpassword)
	},
	_2fa: async (event) => {
		const form = await superValidate(event, zod(_2faSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { code, secret } = form.data

		if (authenticator.check(code.toString(), secret)) {
			await db
				.update(usersTable)
				.set({ _2fasecret: secret })
				.where(eq(usersTable.userid, event.locals.user.userid))
		} else {
			return setError(form, 'code', 'Invalid code')
		}
	},
	_2fadisable: async (event) => {
		const form = await superValidate(event, zod(_2faDisableSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { code } = form.data

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.userid, event.locals.user.userid),
			columns: {
				_2fasecret: true
			}
		})

		if (!user?._2fasecret) {
			return setError(form, 'code', '2FA is not enabled')
		}

		if (await limiter.isLimited(event)) {
			return setError(form, 'code', 'Your submitting too fast!')
		}

		if (authenticator.check(code.toString(), user._2fasecret)) {
			await db
				.update(usersTable)
				.set({ _2fasecret: null })
				.where(eq(usersTable.userid, event.locals.user.userid))
		} else {
			return setError(form, 'code', 'Invalid code')
		}
	}
}
