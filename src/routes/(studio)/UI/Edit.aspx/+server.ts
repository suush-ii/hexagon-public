import { db } from '$src/lib/server/db'
import { auth } from '$src/lib/server/lucia'
import { assetTable, assetVersionsTable } from '$src/lib/server/schema'
import { error, fail, text, type RequestHandler } from '@sveltejs/kit'
import { LuciaError } from 'lucia'
import { createHash } from 'node:crypto'
import pako from 'pako'
import { count, eq } from 'drizzle-orm'
import type { assetStates } from '$src/lib/types'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName } from '$src/stores'
import { S3 } from '$src/lib/server/s3'
import { ideAssetSchema } from './schema'

export const POST: RequestHandler = async ({ cookies, request, url }) => {
	const result = await ideAssetSchema.safeParseAsync({
		assetid: url.searchParams.get('assetId')
	})

	if (!result.success) {
		return error(400, { success: false, message: 'invalid form', data: {} })
	}

	let session

	const authBearer = cookies.get('.ROBLOSECURITY') ?? ''

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

	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, result.data.assetid),
		columns: {
			assetname: true,
			creatoruserid: true,
			assetid: true,
			moderationstate: true,
			simpleasseturl: true,
			created: true
		}
	})

	if (!asset) {
		return error(404, { success: false, message: 'Asset not found.', data: {} })
	}

	if (asset.creatoruserid != session.userid) {
		return error(403, { success: false, message: 'You do not own this asset.', data: {} })
	}

	if (asset.moderationstate !== 'approved') {
		return error(403, {
			message: 'This asset is not approved.',
			success: false,
			data: {}
		})
	}

	const file = pako.inflate(Buffer.from(await request.arrayBuffer())) // studio compresses the rbxl for some reason

	if (file.byteLength > 10485760) {
		return error(400, { message: 'File is too large!', success: false, data: {} })
	}

	const Key = 'models'

	const fileName = Buffer.from(createHash('sha512').update(file).digest('hex')).toString()

	const alreadyModerated = await db
		.select({ moderationState: assetTable.moderationstate })
		.from(assetTable)
		.where(eq(assetTable.simpleasseturl, fileName))

	let moderationState: assetStates = 'approved'

	if (alreadyModerated.length > 0) {
		moderationState = alreadyModerated[0].moderationState // auto deny or approve the same hashes
	}

	if (moderationState !== 'rejected') {
		const command = new PutObjectCommand({
			Bucket: s3BucketName,
			Key: Key + '/' + fileName,
			Body: file
		})
		try {
			await S3.send(command)
		} catch (err) {
			console.log(err)

			return error(500)
		}
	}

	const [assetVersionsCount] = await db
		.select({ count: count() })
		.from(assetVersionsTable)
		.where(eq(assetVersionsTable.assetid, result.data.assetid))
		.limit(1)

	await db.transaction(async (tx) => {
		try {
			await db
				.update(assetTable)
				.set({
					simpleasseturl: fileName,
					updated: new Date(),
					moderationstate: moderationState,
					assetrender: null,
					_3dmanifest: null
				})
				.where(eq(assetTable.assetid, result.data.assetid))

			if (assetVersionsCount.count <= 0 && asset.simpleasseturl) {
				await tx.insert(assetVersionsTable).values({
					assetid: result.data.assetid,
					filehash: asset.simpleasseturl,
					time: asset.created
				}) // store the old version first
			}

			await tx.insert(assetVersionsTable).values({
				assetid: result.data.assetid,
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
