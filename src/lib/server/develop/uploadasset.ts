import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms/server'

import { _uploadableAssets } from '$src/routes/(main)/develop/[item]/+layout.server'
import { createHash } from 'node:crypto'
import { assetTable, gamesTable, placesTable } from '$src/lib/server/schema'
import type { assetStates } from '$src/lib/types'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName } from '$src/stores'
import { fail } from 'sveltekit-superforms'
import { db } from '$src/lib/server/db'
import { S3 } from '$src/lib/server/s3'
import { eq } from 'drizzle-orm'

export async function uploadAsset(
	file: File,
	item: string,
	form: SuperValidated<any, any, any>,
	userid: number
) {
	let mimeTypes = _uploadableAssets[item].mimeTypes

	if (file.size / Math.pow(1024, 2) > 10) {
		// 10mb
		return setError(form, 'asset', 'File is too large!')
	}

	try {
		const fileBuffer = Buffer.from(await file.arrayBuffer())

		const fileName = Buffer.from(createHash('sha512').update(fileBuffer).digest('hex')).toString()

		if (mimeTypes.some((e) => e === file.type) === false) {
			return fail(400, {
				form
			})
		}

		const alreadyModerated = await db
			.select({ moderationState: assetTable.moderationstate })
			.from(assetTable)
			.where(eq(assetTable.simpleasseturl, fileName))

		let moderationState: assetStates = 'pending'

		if (item === 'hats' || item === 'faces' || item === 'gears') {
			moderationState = 'approved' // auto approve these
		}

		if (alreadyModerated.length > 0) {
			moderationState = alreadyModerated[0].moderationState // auto deny or approve the same hashes
		}

		let Key = item

		if (Key === 'shirts' || Key === 'pants' || Key === 'decals') {
			Key = 'images'
		}

		if (moderationState !== 'rejected') {
			// do not upload if it was previously rejected
			const command = new PutObjectCommand({
				Bucket: s3BucketName,
				Key: Key + '/' + fileName,
				Body: fileBuffer,
				ContentType: file.type
			})
			try {
				await S3.send(command)
			} catch (err) {
				console.log(err)

				return fail(500, {
					form
				})
			}
		}

		if (item === 'games') {
			await db.transaction(async (tx) => {
				try {
					let [gameResponse] = await tx
						.insert(gamesTable)
						.values({
							gamename: form.data.name,
							description: form.data.description,
							creatoruserid: userid,
							genre: form.data.genre,
							serversize: form.data.serversize
						})
						.returning({ universeid: gamesTable.universeid })

					let [assetResponse] = await tx
						.insert(assetTable)
						.values({
							assetname: form.data.name,
							assetType: 'games',
							creatoruserid: userid,
							moderationstate: 'approved'
						})
						.returning({ assetid: assetTable.assetid })

					await tx.insert(placesTable).values({
						placeid: assetResponse.assetid,
						universeid: gameResponse.universeid,
						placeurl: fileName,
						startplace: true
					})
				} catch {
					tx.rollback()
					return fail(500, {
						form
					})
				}
			})
		}

		if (item === 'audio' || item === 'hats' || item === 'faces') {
			const [assetResponse] = await db
				.insert(assetTable)
				.values({
					assetname: form.data.name,
					assetType: item,
					creatoruserid: userid,
					simpleasseturl: fileName,
					moderationstate: moderationState,
					price: form.data.price,
					description: form.data.description,
					genres: form.data.genres
				})
				.returning({ assetid: assetTable.assetid })

			return assetResponse.assetid
		}

		if (item === 'gears') {
			const [assetResponse] = await db
				.insert(assetTable)
				.values({
					assetname: form.data.name,
					assetType: item,
					creatoruserid: userid,
					simpleasseturl: fileName,
					moderationstate: moderationState,
					price: form.data.price,
					description: form.data.description,
					genres: form.data.genres,
					gearattributes: form.data.gearattributes
				})
				.returning({ assetid: assetTable.assetid })

			return assetResponse.assetid
		}

		if (item === 'shirts' || item === 'pants' || item === 'decals') {
			// these are all handled the same which is through image and xml
			await db.transaction(async (tx) => {
				try {
					let [imageResponse] = await tx
						.insert(assetTable)
						.values({
							assetname: form.data.name,
							assetType: 'images',
							creatoruserid: userid,
							simpleasseturl: fileName,
							moderationstate: moderationState,
							price: 0
						})
						.returning({ assetid: assetTable.assetid })

					await tx.insert(assetTable).values({
						assetname: form.data.name,
						assetType: item,
						creatoruserid: userid,
						moderationstate: moderationState,
						associatedimageid: imageResponse.assetid,
						price: form.data.price,
						description: form.data.description,
						genres: form.data.genres
					})
				} catch {
					tx.rollback()
					return fail(500, {
						form
					})
				}
			})
		}
	} catch (err) {
		console.log(err)
		return fail(500, {
			form
		})
	}
}
