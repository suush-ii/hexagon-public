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
	userid: number,
	assetname?: string,
	universeid?: number // for places
) {
	const mimeTypes = _uploadableAssets[item].mimeTypes

	if (file.size > 10485760) {
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

		const alreadyModeratedPlace = await db.query.placesTable.findFirst({
			where: eq(placesTable.placeurl, fileName),
			columns: {},
			with: {
				associatedasset: {
					columns: {
						moderationstate: true
					}
				}
			}
		})

		let moderationState: assetStates = 'pending'

		if (item === 'hats' || item === 'faces' || item === 'gears' || item === 'heads') {
			moderationState = 'approved' // auto approve these
		}

		if (alreadyModerated.length > 0) {
			moderationState = alreadyModerated[0].moderationState // auto deny or approve the same hashes
		}

		if (alreadyModeratedPlace?.associatedasset.moderationstate) {
			moderationState = alreadyModeratedPlace.associatedasset.moderationstate
		}

		let Key = item

		if (
			Key === 'shirts' ||
			Key === 'pants' ||
			Key === 't-shirts' ||
			Key === 'decals' ||
			Key === 'badges' ||
			Key === 'gamepasses'
		) {
			Key = 'images'
		}

		if (Key === 'places') {
			Key = 'games'
		}

		if (moderationState !== 'rejected') {
			// do not upload if it was previously rejected
			//if (item === 'hats') {
			//	let fileString = fileBuffer.toString()
			//	fileString = fileString.replaceAll('Accessory', 'Hat')
			//	fileBuffer = Buffer.from(fileString)
			//}

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

		if (item === 'games' && universeid) {
			//place upload that is part of a "universe"

			await db.transaction(async (tx) => {
				try {
					const [assetResponse] = await tx
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
						universeid: universeid,
						placeurl: fileName,
						startplace: false,
						placename: form.data.name,
						allowedgear: ['Social items']
					})
				} catch (err) {
					console.log(err)
					tx.rollback()
					return fail(500, {
						form
					})
				}
			})

			return
		}

		if (item === 'games') {
			await db.transaction(async (tx) => {
				try {
					const [gameResponse] = await tx
						.insert(gamesTable)
						.values({
							description: form.data.description,
							creatoruserid: userid,
							genre: form.data.genre,
							serversize: form.data.serversize
						})
						.returning({ universeid: gamesTable.universeid })

					const [assetResponse] = await tx
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
						startplace: true,
						placename: form.data.name,
						allowedgear: ['Social items']
					})
				} catch {
					tx.rollback()
					return fail(500, {
						form
					})
				}
			})
		}

		if (item === 'audio' || item === 'hats' || item === 'faces' || item === 'heads') {
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

		if (item === 'images') {
			const [assetResponse] = await db
				.insert(assetTable)
				.values({
					assetname: assetname ?? '',
					assetType: item,
					creatoruserid: userid,
					simpleasseturl: fileName,
					moderationstate: moderationState,
					price: 0,
					description: '',
					genres: []
				})
				.returning({ assetid: assetTable.assetid })

			return assetResponse.assetid
		}

		if (
			item === 'shirts' ||
			item === 'pants' ||
			item === 't-shirts' ||
			item === 'decals' ||
			item === 'badges' ||
			item === 'gamepasses'
		) {
			// these are all handled the same which is through image and xml
			const assetResponse = await db.transaction(async (tx) => {
				try {
					const [imageResponse] = await tx
						.insert(assetTable)
						.values({
							assetname: form.data.name,
							assetType: 'images',
							creatoruserid: userid,
							simpleasseturl: fileName,
							moderationstate: moderationState,
							price: 0,
							onsale: false
						})
						.returning({ assetid: assetTable.assetid })

					const [assetResponse] = await tx
						.insert(assetTable)
						.values({
							assetname: form.data.name,
							assetType: item,
							creatoruserid: userid,
							moderationstate: moderationState,
							associatedimageid: imageResponse.assetid,
							price: form.data.price,
							description: form.data.description,
							genres: form.data.genres
						})
						.returning({ assetid: assetTable.assetid })

					return assetResponse.assetid
				} catch {
					tx.rollback()
					return fail(500, {
						form
					})
				}
			})

			return assetResponse
		}
	} catch (err) {
		console.log(err)
		return fail(500, {
			form
		})
	}
}
