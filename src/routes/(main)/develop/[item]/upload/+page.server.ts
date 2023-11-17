import type { PageServerLoad, Actions } from './$types'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$src/lib/schemas/gameschema'
import { createHash } from 'node:crypto'
import { fail, redirect } from '@sveltejs/kit'
import { _uploadableAssets } from '../+layout'
import { s3BucketName } from '$src/stores'
import {
	CLOUDFLARE_S3_ACCESS_KEY,
	CLOUDFLARE_S3_ACCESS_KEY_ID,
	CLOUDFLARE_S3_ACCOUNT_ID
} from '$env/static/private'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { _assetSchema } from '../+layout'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema/assets'
import { gamesTable, placesTable } from '$lib/server/schema/games'

const S3 = new S3Client({
	region: 'auto',
	endpoint: `https://${CLOUDFLARE_S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: CLOUDFLARE_S3_ACCESS_KEY_ID,
		secretAccessKey: CLOUDFLARE_S3_ACCESS_KEY
	}
})

export const load: PageServerLoad = async () => {
	return {
		form: superValidate(formSchema)
	}
}

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, formSchema)

		const result = await _assetSchema.safeParseAsync(params.item)

		if (result.success === false) {
			return fail(400, {
				form
			})
		}

		if (!form.valid) {
			return fail(400, {
				form
			})
		}
		let mimeTypes = _uploadableAssets[params.item].mimeTypes

		const file = formData.get('asset')
		if (file instanceof File) {
			if (file.size / Math.pow(1024, 2) > 10) {
				// 10mb
				return setError(form, 'asset', 'File is too large!')
			}

			try {
				const fileBuffer = Buffer.from(await file.arrayBuffer())

				const fileName = Buffer.from(
					createHash('sha512').update(fileBuffer).digest('hex')
				).toString()

				if (mimeTypes.some((e) => e === file.type) === false) {
					return fail(400, {
						form
					})
				}

				const command = new PutObjectCommand({
					Bucket: s3BucketName,
					Key: params.item + '/' + fileName,
					Body: fileBuffer,
					ContentType: file.type
				})
				const result = await S3.send(command)
				//console.log('File uploaded successfully:', fileName)
				//console.log(params.item)

				if (params.item === 'games') {
					await db.transaction(async (tx) => {
						try {
							let [gameResponse] = await tx
								.insert(gamesTable)
								.values({
									gamename: form.data.name,
									description: form.data.description,
									creatoruserid: locals.session.user.userid,
									genre: form.data.genre
								})
								.returning({ universeid: gamesTable.universeid })

							let [assetResponse] = await tx
								.insert(assetTable)
								.values({
									assetname: form.data.name,
									assetType: 'games',
									creatoruserid: locals.session.user.userid,
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

					throw redirect(302, '/develop/games')
				}

				if (params.item === 'audio' || params.item === 'decals') {
					await db.insert(assetTable).values({
						assetname: form.data.name,
						assetType: params.item,
						creatoruserid: locals.session.user.userid,
						simpleasseturl: fileName,
						moderationstate: 'pending'
					})
				}
			} catch (err) {
				console.log(err)
				return fail(500, {
					form
				})
			}
		}

		return {
			form
		}
	}
}
