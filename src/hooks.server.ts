import * as Sentry from '@sentry/sveltekit'
import { sequence } from '@sveltejs/kit/hooks'
import { redirect, type Handle } from '@sveltejs/kit'
import { configTable } from '$lib/server/schema/config'
import { db } from '$lib/server/db'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { auth } from '$lib/server/lucia'
import { dev } from '$app/environment'
import { usersTable, transactionsTable } from '$lib/server/schema/users'
import { eq } from 'drizzle-orm'
import { s3BucketName } from '$src/stores'
import { rccAuth } from './routes/(rcc)/updatejob/auth.server'
import { get } from '$lib/server/config'

import {
	CLOUDFLARE_S3_ACCESS_KEY,
	CLOUDFLARE_S3_ACCESS_KEY_ID,
	CLOUDFLARE_S3_ACCOUNT_ID
} from '$env/static/private'
import { CreateBucketCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'

Sentry.init({
	dsn: 'https://c9543d19a6acc39bb47247c97d9fca37@o4506000665542656.ingest.us.sentry.io/4507127264509952',
	tracesSampleRate: 1
})

const S3 = new S3Client({
	region: 'auto',
	endpoint: `https://${CLOUDFLARE_S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: CLOUDFLARE_S3_ACCESS_KEY_ID,
		secretAccessKey: CLOUDFLARE_S3_ACCESS_KEY
	}
})
const command = new HeadBucketCommand({ Bucket: s3BucketName })
try {
	await S3.send(command)
} catch (error) {
	// bucket doesn't exist
	const createBucketCommand = new CreateBucketCommand({
		Bucket: s3BucketName
	})
	await S3.send(createBucketCommand)
}

const protectedRoutes = [
	'/home',
	'/catalog',
	'/develop',
	'/games',
	'/settings',
	'/transactions',
	'/avatar',
	'/friends',
	'/users'
]
const adminProtectedRoutes = ['/admin', '/api/admin']

const permissionLevels = [
	{ name: 'owner', level: 1 },
	{ name: 'admin', level: 2 },
	{ name: 'mod', level: 3 },
	{ name: 'uploader', level: 4 },
	{ name: 'normal', level: 5 }
]

const adminPanelPermissions = [
	{ path: '/admin/sitealert', requiredLevel: 1 },
	{ path: '/admin/configuration', requiredLevel: 1 },
	{ path: '/admin/reports', requiredLevel: 3 },
	{ path: '/admin/users', requiredLevel: 3 },
	{ path: '/admin/catalog', requiredLevel: 4 },
	{ path: '/admin/logs', requiredLevel: 4 }
]

const skipAuth = [
	'/api/avatarthumbnail',
	'/asset',
	'/asset/characterfetch.ashx',
	'/asset/bodycolors.ashx',
	'/game/tools/insertasset.ashx',
	'/game/tools/thumbnailasset.ashx',
	'/game/validate-machine',
	'/game/studio.ashx',
	'/game/players',
	'/game/gameserver.ashx',
	'/Setting/QuietGet/ClientAppSettings',
	'/Setting/QuietGet/ClientSharedSettings',
	'/Setting/QuietGet/RCCService',
	'/game/JoinRate.ashx',
	'/game/MachineConfiguration.ashx',
	'/game/report-stats',
	'/api/clicker'
] // speeds requests significantly

await migrate(db, { migrationsFolder: './drizzle' })

export const handle: Handle = sequence(
	Sentry.sentryHandle(),
	sequence(rccAuth, async ({ event, resolve }) => {
		// Stage 1
		console.log(event.url.pathname)

		const config = get()

		if (config?.[0]?.maintenanceEnabled === true) {
			if (event.url.pathname != '/maintenance') {
				redirect(302, '/maintenance')
			}
		}

		if (
			skipAuth.some((substr) =>
				event.url.pathname.toLowerCase().startsWith(substr.toLowerCase())
			) === true
		) {
			event.locals.config = config

			const response = await resolve(event)
			return response
		}

		event.locals.auth = auth.handleRequest(event)

		event.locals.config = config

		const session = await event.locals.auth.validate()

		const user = session?.user

		if (session) {
			if (user) {
				event.locals.user = user
			}

			const currentTime = new Date()

			if (currentTime.valueOf() - Date.parse(user.lastactivetime) > 3 * 60 * 1000) {
				// they haven't visited in over 3 mins
				// the reason why we don't update last active on every request is to minimize database requests
				const [newUser] = await db
					.update(usersTable)
					.set({ lastactivetime: currentTime })
					.where(eq(usersTable.userid, user.userid))
					.returning({ lastip: usersTable.lastip })

				const currentIp = event.getClientAddress()

				if (newUser?.lastip !== currentIp) {
					await db
						.update(usersTable)
						.set({ lastip: currentIp })
						.where(eq(usersTable.userid, user.userid))
				}
			}

			if (currentTime.valueOf() - Date.parse(user.laststipend) > 24 * 60 * 60 * 1000) {
				// 24 hours
				await db.transaction(async (tx) => {
					try {
						await tx
							.update(usersTable)
							.set({ laststipend: currentTime, coins: Number(event.locals.user.coins) + 25 })
							.where(eq(usersTable.userid, user.userid))

						await tx.insert(transactionsTable).values({
							userid: user.userid,
							type: 'stipend',
							amount: 25
						})
					} catch (e) {
						console.log(e)
						tx.rollback()
						return
					}
				})
			}
		}

		if (
			protectedRoutes.includes(event.url.pathname) === true ||
			protectedRoutes.some((substr) =>
				event.url.pathname.toLowerCase().startsWith(substr.toLowerCase())
			) === true
		) {
			if (!user) {
				redirect(302, '/login')
			}
		}

		if (
			adminProtectedRoutes.includes(event.url.pathname) === true ||
			adminProtectedRoutes.some((substr) =>
				event.url.pathname.toLowerCase().startsWith(substr.toLowerCase())
			) === true
		) {
			if (!user) {
				redirect(302, '/login')
			}

			if (
				user.role !== 'owner' &&
				user.role !== 'admin' &&
				user.role !== 'mod' &&
				user.role !== 'uploader'
			) {
				redirect(302, '/login')
			} else {
				const permissionRequired = adminPanelPermissions.find(
					(permissionRequired) =>
						event.url.pathname.toLowerCase().startsWith(permissionRequired.path.toLowerCase()) ===
						true
				)

				const currentPermissionLevel =
					permissionLevels.find((level) => level.name === user.role)?.level ?? 0

				if (permissionRequired) {
					if (currentPermissionLevel > permissionRequired.requiredLevel) {
						redirect(302, '/admin?error=permission')
					}
				}
			}
		}

		const response = await resolve(event) // Stage 2

		// Stage 3

		return response
	})
)
export const handleError = Sentry.handleErrorWithSentry()
