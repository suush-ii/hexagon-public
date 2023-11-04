import { sequence } from '@sveltejs/kit/hooks'
import * as Sentry from '@sentry/sveltekit'
import { redirect, type Handle } from '@sveltejs/kit'
import { configTable } from '$lib/server/schema/config'
import { db } from '$lib/server/db'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { auth } from '$lib/server/lucia'
import { dev } from '$app/environment'
import { usersTable } from '$lib/server/schema/users'
import { eq } from 'drizzle-orm'
import { appName } from '$src/stores'
import {
	CLOUDFLARE_S3_ACCESS_KEY,
	CLOUDFLARE_S3_ACCESS_KEY_ID,
	CLOUDFLARE_S3_ACCOUNT_ID
} from '$env/static/private'
import {
	CreateBucketCommand,
	HeadBucketCommand,
	S3Client
} from '@aws-sdk/client-s3'

const S3 = new S3Client({
	region: 'auto',
	endpoint: `https://${CLOUDFLARE_S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: CLOUDFLARE_S3_ACCESS_KEY_ID,
		secretAccessKey: CLOUDFLARE_S3_ACCESS_KEY
	}
})
const command = new HeadBucketCommand({Bucket: appName.toLowerCase()});
try {
await S3.send(command);
} catch (error) {
	// bucket doesn't exist
	const createBucketCommand = new CreateBucketCommand({
		Bucket: appName.toLocaleLowerCase(),
	  });
	await S3.send(createBucketCommand);
}

const configPrepared = db.select().from(configTable).limit(1).prepare('configGrab')

Sentry.init({
	dsn: 'https://4d1e802039697045efc6ed728b2bf873@o4506000665542656.ingest.sentry.io/4506000666591232',
	tracesSampleRate: 1,
	environment: dev === true ? 'dev' : 'production'
})

const protectedRoutes = ['/home', '/catalog', '/develop', '/games']
const adminProtectedRoutes = ['/temp/keygen']

await migrate(db, { migrationsFolder: './drizzle' })

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	// Stage 1
	console.log(event.url.pathname)

	const config = await configPrepared.execute()

	if (config.length === 0) {
		await db.insert(configTable).values({})
	}

	if (config?.[0]?.maintenanceEnabled === true) {
		if (event.url.pathname != '/maintenance') {
			throw redirect(302, '/maintenance')
		}
	}

	event.locals.auth = auth.handleRequest(event)

	event.locals.config = config

	const session = await event.locals.auth.validate()
	if (session) {
		event.locals.session = session

		const currentTime = new Date()

		if (currentTime.valueOf() - session.user.lastactivetime > 3 * 60 * 1000) {
			// they haven't visited in over 3 mins
			// the reason why we don't update last active on every request is to minimize database requests
			await db
				.update(usersTable)
				.set({ lastactivetime: currentTime })
				.where(eq(usersTable.userid, session.user.userid))
		}
	}

	if (
		protectedRoutes.includes(event.url.pathname) === true ||
		protectedRoutes.some((substr) =>
			event.url.pathname.toLowerCase().startsWith(substr.toLowerCase())
		) === true
	) {
		if (!session) {
			throw redirect(302, '/login')
		}
	}

	if (
		adminProtectedRoutes.includes(event.url.pathname) === true ||
		adminProtectedRoutes.some((substr) =>
			event.url.pathname.toLowerCase().startsWith(substr.toLowerCase())
		) === true
	) {
		if (!session) {
			throw redirect(302, '/login')
		}

		if (
			session.user.role !== 'owner' &&
			session.user.role !== 'admin' &&
			session.user.role !== 'mod'
		) {
			throw redirect(302, '/login')
		}
	}

	const response = await resolve(event) // Stage 2
	//await pool.end();

	// Stage 3

	return response
})
export const handleError = Sentry.handleErrorWithSentry()
