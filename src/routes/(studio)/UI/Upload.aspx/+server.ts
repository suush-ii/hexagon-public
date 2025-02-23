import { db } from '$src/lib/server/db'
import { auth } from '$src/lib/server/lucia'
import { assetTable, inventoryTable } from '$src/lib/server/schema'
import { error, fail, text, type RequestHandler } from '@sveltejs/kit'
import { LuciaError } from 'lucia'
import { createHash } from 'node:crypto'
import pako from 'pako'
import { eq } from 'drizzle-orm'
import type { assetStates } from '$src/lib/types'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName } from '$src/stores'
import { S3 } from '$src/lib/server/s3'
import { ideAssetSchema } from './schema'
import { z } from 'zod'

export const POST: RequestHandler = async ({ cookies, request, url }) => {
	const result = await ideAssetSchema.safeParseAsync({
		Name: url.searchParams.get('Name'),
		Description: url.searchParams.get('Description'),
		Genre: url.searchParams.get('Genre')
	})

	const animation = await z.coerce
		.string()
		.transform((val) => val === 'true')
		.default('false')
		.safeParseAsync(url.searchParams.get('Animation'))

	if (!result.success || !animation.success) {
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

	const file = pako.inflate(Buffer.from(await request.arrayBuffer())) // studio compresses the rbxl for some reason

	if (file.byteLength > 10485760) {
		return error(400, { message: 'File is too large!', success: false, data: {} })
	}

	const Key = animation.data ? 'animations' : 'models'

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

	const [assetResponse] = await db
		.insert(assetTable)
		.values({
			assetname: result.data.Name,
			assetType: animation.data ? 'animations' : 'models',
			creatoruserid: session.userid,
			simpleasseturl: fileName,
			moderationstate: moderationState,
			price: 0,
			description: result.data.Description,
			genres: [result.data.Genre]
		})
		.returning({ assetid: assetTable.assetid })

	await db.insert(inventoryTable).values({
		itemid: assetResponse.assetid,
		userid: session.userid,
		wearing: false,
		itemtype: animation.data ? 'animations' : 'models'
	})

	return text('')
}
