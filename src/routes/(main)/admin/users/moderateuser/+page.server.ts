import { error, fail, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { usersTable, bansTable, adminLogsTable, assetTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { z } from 'zod'
import { count, eq, desc, or } from 'drizzle-orm'
import { superValidate } from 'sveltekit-superforms'
import { defaultValues, message } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { moderationSchema } from './schema'
import { getPageNumber } from '$src/lib/utils'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName } from '$src/stores'
import { S3 } from '$lib/server/s3'

const permissionLevels = [
	{ name: 'owner', level: 1 },
	{ name: 'admin', level: 2 },
	{ name: 'mod', level: 3 },
	{ name: 'uploader', level: 4 },
	{ name: 'normal', level: 5 }
]

export const load: PageServerLoad = async ({ url }) => {
	if (!url.searchParams.get('id') && !url.searchParams.get('queue')) {
		redirect(302, '/admin/users/find?redirect=moderateuser')
	}

	let page = getPageNumber(url)

	let size = 5

	let queue = url.searchParams.get('queue') === 'true' ? true : false

	let userid

	let asset

	if (queue) {
		const user = await db.query.assetTable.findFirst({
			where: eq(assetTable.topunish, true),
			columns: { simpleasseturl: true, assetname: true, assetType: true, assetid: true },
			with: {
				author: {
					columns: {
						userid: true
					}
				}
			}
		})

		userid = user?.author.userid
		asset = user

		if (!userid) {
			return redirect(302, '/admin/users/find?redirect=moderateuser')
		}
	}

	const result = await z.number().safeParseAsync(Number(url.searchParams.get('id') ?? userid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const punishmentsCount = await db
		.select({ count: count() })
		.from(bansTable)
		.where(eq(bansTable.userid, result.data))
		.limit(1)

	if (punishmentsCount[0].count < (page - 1) * size) {
		page = 1
	}

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, result.data),
		columns: {
			username: true,
			userid: true,
			lastactivetime: true,
			joindate: true
		},
		with: {
			bans: {
				columns: {
					action: true,
					banid: true,
					time: true,
					expiration: true,
					internalreason: true
				},
				with: {
					moderator: {
						columns: {
							username: true,
							userid: true
						}
					}
				},
				orderBy: desc(bansTable.time),
				limit: size,
				offset: (page - 1) * size
			}
		}
	})

	const defaults = defaultValues(zod(moderationSchema))

	defaults.userid = user?.userid
	defaults.assetid = asset?.assetid

	if (user) {
		return {
			username: user.username,
			userid: user.userid,
			lastactivetime: user.lastactivetime,
			joindate: user.joindate,
			form: await superValidate(zod(moderationSchema), { defaults: defaults }),
			punishments: user.bans,
			punishmentsCount: punishmentsCount[0].count,
			asset
		}
	}

	error(404, { success: false, message: 'User not found!' })
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(moderationSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		if (form.data.action === 'None') {
			return { form }
		}

		if (!event.url.searchParams.get('id') && !event.url.searchParams.get('queue')) {
			redirect(302, '/admin/users/find?redirect=moderateuser')
		}

		let queue = event.url.searchParams.get('queue') === 'true' ? true : false

		const result = await z
			.number()
			.safeParseAsync(Number(event.url.searchParams.get('id') ?? form.data.userid))

		if (result.success === false) {
			error(400, { success: false, message: 'Malformed input.' })
		}

		const user = await db
			.select({
				role: usersTable.role,
				username: usersTable.username
			})
			.from(usersTable)
			.where(eq(usersTable.userid, result.data))
			.limit(1)

		if (user.length === 0) {
			error(404, { success: false, message: 'User not found!' })
		}

		const recipientPermissionLevel =
			permissionLevels.find((level) => level.name === user[0].role)?.level ?? 0

		const currentPermissionLevel =
			permissionLevels.find((level) => level.name === event.locals.user.role)?.level ?? 0

		if (currentPermissionLevel > recipientPermissionLevel) {
			return fail(403, {
				success: false,
				message: 'You do not have permission to moderate this user.'
			})
		}

		const expiration = new Date()

		if (form.data.scrubusername === false) {
			if (form.data.action === 'Ban 1 Day') {
				expiration.setDate(expiration.getDate() + 1)
			} else if (form.data.action === 'Ban 7 Days') {
				expiration.setDate(expiration.getDate() + 7)
			} else if (form.data.action === 'Ban 14 Days') {
				expiration.setDate(expiration.getDate() + 14)
			}
		}

		const [ban] = await db
			.insert(bansTable)
			.values({
				action: form.data.scrubusername === true ? 'Delete' : form.data.action,
				userid: result.data,
				reason: form.data.note,
				internalreason: form.data.internalnote,
				expiration: expiration,
				moderatorid: event.locals.user.userid,
				offensiveassetid: form.data.assetid ?? null
			})
			.returning({ banid: bansTable.banid })

		if (
			(form.data.action === 'Ban 1 Day' ||
				form.data.action === 'Ban 7 Days' ||
				form.data.action === 'Ban 14 Days') &&
			form.data.scrubusername === false
		) {
			await db.insert(adminLogsTable).values({
				userid: event.locals.user.userid,
				associatedid: result.data,
				associatedidtype: 'user',
				action: 'ban',
				banlength: form.data.action
			})
		}

		if (
			form.data.action === 'Delete' ||
			form.data.action === 'Poison' ||
			form.data.scrubusername === true
		) {
			await db.insert(adminLogsTable).values({
				userid: event.locals.user.userid,
				associatedid: result.data,
				associatedidtype: 'user',
				action: form.data.action === 'Poison' ? 'poison' : 'terminate'
			})

			if (form.data.action === 'Poison') {
				const ips = await db
					.select({ lastip: usersTable.lastip, registerip: usersTable.registerip })
					.from(usersTable)
					.where(eq(usersTable.userid, result.data))
					.limit(1)

				let poisoned = await db
					.select({ userid: usersTable.userid })
					.from(usersTable)
					.where(
						or(
							eq(usersTable.lastip, ips[0].lastip ?? ''),
							eq(usersTable.registerip, ips[0].registerip ?? ''),
							eq(usersTable.registerip, ips[0].lastip ?? ''),
							eq(usersTable.lastip, ips[0].registerip ?? '')
						)
					)
					.limit(50) // how

				for (const user of poisoned) {
					await db.insert(adminLogsTable).values({
						userid: event.locals.user.userid,
						associatedid: user.userid,
						associatedidtype: 'user',
						action: 'poison'
					})

					await db
						.update(usersTable)
						.set({ banid: ban.banid })
						.where(eq(usersTable.userid, user.userid))
				}
			}

			if (form.data.scrubusername === true) {
				await db
					.update(usersTable)
					.set({ username: `[Content Deleted ${result.data}]`, scrubbedusername: user[0].username })
					.where(eq(usersTable.userid, result.data))
			}
		}

		await db.update(usersTable).set({ banid: ban.banid }).where(eq(usersTable.userid, result.data))

		if (queue && form.data.assetid) {
			const [toDelete] = await db
				.update(assetTable)
				.set({ topunish: false, punished: true })
				.where(eq(assetTable.assetid, form.data.assetid))
				.returning({ assetType: assetTable.assetType, simpleAssetUrl: assetTable.simpleasseturl })

			const Key = toDelete.assetType

			const fileName = toDelete.simpleAssetUrl

			const command = new DeleteObjectCommand({
				Bucket: s3BucketName,
				Key: Key + '/' + fileName
			})
			try {
				await S3.send(command)
			} catch (err) {
				console.log(err)
			}
		}
		return {
			form
		}
	}
}
