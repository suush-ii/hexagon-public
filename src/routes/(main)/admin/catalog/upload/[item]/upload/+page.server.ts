import type { PageServerLoad, Actions } from './$types'
import { fail } from 'sveltekit-superforms'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'
import { formSchema as gearSchema } from '$lib/schemas/gearschema'
import { formSchema as packageSchema } from '$lib/schemas/packageschema'
import { redirect } from '@sveltejs/kit'
import { uploadAsset } from '$lib/server/develop/uploadasset'
import { z } from 'zod'
import { adminLogsTable, assetTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import type { RobloxCatalogApiBundleDetailsModel } from '$lib/server/catalogApi'
import type { RobloxApiAvatarModelsOutfitDetailsModel } from '$lib/server/avatarApi'
import { createHash } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName } from '$src/stores'
import { S3 } from '$lib/server/s3'
import type { AssetTypes } from '$lib/types'
import { outfitsTable } from '$lib/server/schema/outfits'

const _assetSchema = z.enum(['hats', 'faces', 'gears', 'packages'])

export const load: PageServerLoad = async () => {
	const assetForm = await superValidate(zod(assetSchema))

	const gearForm = await superValidate(zod(gearSchema))

	const packageForm = await superValidate(zod(packageSchema))

	return {
		assetForm,
		gearForm,
		packageForm
	}
}

function assetTypeFromEnum(value: number | undefined): AssetTypes {
	switch (value) {
		case 41:
		case 8:
			return 'hats'
		case 17:
		case 79:
			return 'heads'
		case 18:
			return 'faces'
		case 19:
			return 'gears'
		case 27:
			return 'torsos'
		case 28:
			return 'r arms'
		case 29:
			return 'l arms'
		case 30:
			return 'l legs'
		case 31:
			return 'r legs'
		default:
			throw 'Unsupported'
	}
}

export const actions: Actions = {
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
		const assetid = await uploadAsset(file, params.item, form, locals.user.userid)

		const numAssetId = Number(assetid)

		await db.insert(adminLogsTable).values({
			userid: locals.user.userid,
			associatedid: numAssetId,
			associatedidtype: 'item',
			action: 'uploadasset'
		})

		return redirect(302, '/admin/catalog/upload/' + params.item)
	},
	gear: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(gearSchema))

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
		const assetid = await uploadAsset(file, params.item, form, locals.user.userid)

		const numAssetId = Number(assetid)

		await db.insert(adminLogsTable).values({
			userid: locals.user.userid,
			associatedid: numAssetId,
			associatedidtype: 'item',
			action: 'uploadasset'
		})

		return redirect(302, '/admin/catalog/upload/' + params.item)
	},
	package: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(packageSchema))

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

		const bundleInfo = await fetch(
			`https://catalog.roblox.com/v1/bundles/${form.data.bundleid}/details`
		)

		if (bundleInfo.status !== 200) {
			return setError(form, 'bundleid', 'Bundle ID not found')
		}

		const bundleInfoJson: RobloxCatalogApiBundleDetailsModel = await bundleInfo.json()

		const assetids: number[] = []

		let userOutfit = false

		await db.transaction(async (tx) => {
			for (const item of bundleInfoJson.items ?? []) {
				if (item.type === 'UserOutfit' && !userOutfit) {
					const outfit = await fetch(`https://avatar.roblox.com/v1/outfits/${item.id}/details`)

					if (outfit.status !== 200) {
						tx.rollback()

						return setError(form, 'bundleid', 'Ratelimited')
					}

					userOutfit = true

					const outfitJson: RobloxApiAvatarModelsOutfitDetailsModel = await outfit.json()

					for (const item of outfitJson.assets ?? []) {
						const response = await fetch(
							`https://assetdelivery.roblox.com/v1/asset/?id=${item.id}&version=${form.data.assetversion}`,
							{
								headers: { 'User-Agent': 'Roblox/WinInet' }
							}
						)

						if (response.status !== 200) {
							tx.rollback()
							return setError(form, 'bundleid', 'error')
						}

						const assetData = Buffer.from(await response.arrayBuffer())

						const fileName = Buffer.from(
							createHash('sha512').update(assetData).digest('hex')
						).toString()

						try {
							const assetType = assetTypeFromEnum(item?.assetType?.id)

							const Key = ['hats', 'gears', 'faces'].includes(assetType) ? assetType : 'packages'

							const command = new PutObjectCommand({
								Bucket: s3BucketName,
								Key: Key + '/' + fileName,
								Body: assetData
							})
							try {
								await S3.send(command)
							} catch (err) {
								console.log(err)

								tx.rollback()

								return fail(500, {
									form
								})
							}

							const [asset] = await tx
								.insert(assetTable)
								.values({
									assetname: item.name ?? '',
									assetType: assetType,
									creatoruserid: locals.user.userid,
									simpleasseturl: fileName,
									moderationstate: 'approved',
									price: 0,
									description: '',
									genres: ['All'],
									onsale: false
								})
								.returning({ assetid: assetTable.assetid })

							assetids.push(asset.assetid)
						} catch {}
					}
				}
			}

			const [packageAsset] = await tx
				.insert(assetTable)
				.values({
					assetname: bundleInfoJson.name ?? '',
					assetType: 'packages',
					creatoruserid: locals.user.userid,
					moderationstate: 'approved',
					price: form.data.price,
					description: bundleInfoJson.description,
					genres: ['All']
				})
				.returning({ assetid: assetTable.assetid })

			await tx.insert(outfitsTable).values({
				assets: assetids,
				associatedpackageid: packageAsset.assetid
			})

			await tx.insert(adminLogsTable).values({
				userid: locals.user.userid,
				associatedid: packageAsset.assetid,
				associatedidtype: 'item',
				action: 'uploadasset'
			})
		})

		return redirect(302, '/admin/catalog/upload/' + params.item)
	}
}
