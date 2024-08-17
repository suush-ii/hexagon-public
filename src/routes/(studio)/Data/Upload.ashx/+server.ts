import { auth } from '$lib/server/lucia'
import { db } from '$lib/server/db'
import { error, text, type RequestHandler } from '@sveltejs/kit'
import { LuciaError } from 'lucia'
import { z } from 'zod'
import { count, eq } from 'drizzle-orm'
import { assetVersionsTable, placesTable } from '$lib/server/schema'
import { S3 } from '$src/lib/server/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName } from '$src/stores'
import { createHash } from 'node:crypto'
import pako from 'pako'
import { RateLimiter } from 'sveltekit-rate-limiter/server'

const limiter = new RateLimiter({
	IP: [1, '15s']
})

export const POST: RequestHandler = async (event) => {
	const { request, url, cookies } = event

	let authBearer = url.searchParams.get('auth') ?? cookies.get('.ROBLOSECURITY') ?? ''

	const result = await z.coerce
		.number()
		.int()
		.positive()
		.safeParseAsync(url.searchParams.get('assetid') ?? '')

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const assetId = result.data

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

	if (await limiter.isLimited(event)) {
		return error(429, {
			success: false,
			message: 'Your uploading too fast!',
			data: {}
		})
	}

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, assetId),
		columns: { placeurl: true, created: true },
		with: {
			associatedgame: {
				columns: {
					creatoruserid: true
				}
			}
		}
	})

	if (!place) {
		return error(404, { message: 'Place not found!', success: false, data: {} })
	}

	if (place.associatedgame.creatoruserid != session.userid) {
		return error(403, {
			message: 'You do not have permission to upload files to this place.',
			success: false,
			data: {}
		})
	}

	const file = pako.inflate(Buffer.from(await request.arrayBuffer())) // studio compresses the rbxl for some reason

	if (file.byteLength > 10485760) {
		return error(400, { message: 'File is too large!', success: false, data: {} })
	}

	let Key = 'games'

	const fileName = Buffer.from(createHash('sha512').update(file).digest('hex')).toString()

	const command = new PutObjectCommand({
		Bucket: s3BucketName,
		Key: Key + '/' + fileName,
		Body: file
	})
	try {
		await S3.send(command)
	} catch (err) {
		return error(500, {
			message: '',
			success: false,
			data: {}
		})
	}

	const [assetVersionsCount] = await db
		.select({ count: count() })
		.from(assetVersionsTable)
		.where(eq(assetVersionsTable.assetid, assetId))
		.limit(1)

	await db.transaction(async (tx) => {
		try {
			await tx
				.update(placesTable)
				.set({ placeurl: fileName, updated: new Date() })
				.where(eq(placesTable.placeid, assetId))

			if (assetVersionsCount.count <= 0) {
				await tx.insert(assetVersionsTable).values({
					assetid: assetId,
					filehash: place.placeurl,
					time: place.created
				}) // store the old version first
			}

			await tx.insert(assetVersionsTable).values({
				assetid: assetId,
				filehash: fileName
			})
		} catch (e) {
			console.log(e)
			tx.rollback()
			return
		}
	})

	return text('')
}
