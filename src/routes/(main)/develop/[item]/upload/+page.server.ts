import type { PageServerLoad, Actions } from './$types'
import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms/server'
import { fail } from 'sveltekit-superforms'
import { formSchema as gameSchema } from '$lib/schemas/gameschema'
import { formSchema as clothingSchema } from '$lib/schemas/clothingschema'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'
import { createHash } from 'node:crypto'
import { redirect } from '@sveltejs/kit'
import { _uploadableAssets } from '../+layout'
import { s3BucketName } from '$src/stores'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { _assetSchema } from '../+layout'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema/assets'
import { gamesTable, placesTable } from '$lib/server/schema/games'
import { zod } from 'sveltekit-superforms/adapters'
import { eq } from 'drizzle-orm'
import type { assetStates } from '$lib/types'
import { S3 } from '$lib/server/s3'

export const load: PageServerLoad = async () => {
	const gameForm = await superValidate(zod(gameSchema))
	const clothingForm = await superValidate(zod(clothingSchema))
	const assetForm = await superValidate(zod(assetSchema))

	return {
		gameForm,
		clothingForm,
		assetForm
	}
}

async function uploadAsset(
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

		if (item === 'audio') {
			await db.insert(assetTable).values({
				assetname: form.data.name,
				assetType: item,
				creatoruserid: userid,
				simpleasseturl: fileName,
				moderationstate: moderationState,
				price: form.data.price,
				description: form.data.description
			})
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
						description: form.data.description
					})
				} catch {
					tx.rollback()
					return fail(500, {
						form
					})
				}
			})
		}

		// TODO: shirts and pantssss
	} catch (err) {
		console.log(err)
		return fail(500, {
			form
		})
	}
}

export const actions: Actions = {
	game: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(gameSchema))

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

		const file = form.data.asset
		uploadAsset(file, params.item, form, locals.user.userid)
		return redirect(302, '/develop/' + params.item)
	},
	clothing: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(clothingSchema))

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

		const file = form.data.asset
		uploadAsset(file, params.item, form, locals.user.userid)
		return redirect(302, '/develop/' + params.item)
	},
	asset: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(assetSchema))

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

		const file = form.data.asset
		uploadAsset(file, params.item, form, locals.user.userid)

		return redirect(302, '/develop/' + params.item)
	}
}
