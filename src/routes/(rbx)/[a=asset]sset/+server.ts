import { type RequestHandler, error, redirect, text } from '@sveltejs/kit'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { assetTable, assetCacheTable } from '$lib/server/schema/assets'
import { eq } from 'drizzle-orm'
import { s3Url } from '$src/stores'
import { env } from '$env/dynamic/private'
import parse from 'meshconvert'
import { createSign } from 'node:crypto'
import pantsTemplate from './templates/pantsTemplate.xml?raw'
import shirtTemplate from './templates/shirtTemplate.xml?raw'
import tshirtTemplate from './templates/tshirtTemplate.xml?raw'
import decalTemplate from './templates/decalTemplate.xml?raw'
import { building } from '$app/environment'
import { auth } from '$lib/server/lucia'

export const trailingSlash = 'ignore'
let luas = formatPath(
	import.meta.glob(['./common/*.lua', './common/2014L/*.lua', './common/2013L/*.lua'], {
		eager: true,
		query: '?raw',
		import: 'default'
	})
)

if (!building) {
	luas = Object.fromEntries(
		Object.entries(luas).map(([key, _corescript]) => {
			let corescript: string = _corescript as string
			corescript = corescript.replaceAll('www.roblox.com', env.BASE_URL as string)

			corescript = `--rbxassetid%${key}%\r` + corescript
			const sign = createSign('SHA1')
			sign.update('\r\n' + corescript)

			const signature = sign.sign(env.CLIENT_PRIVATE_KEY as string, 'base64')

			corescript = '--rbxsig%' + signature + '%\r\n' + corescript
			return [key, corescript]
		})
	)
}

function formatPath(glob: Record<string, unknown>) {
	return Object.fromEntries(
		Object.entries(glob).map(([key, value]) => {
			const path = key?.split('/')?.at(-1)?.split('.')[0]
			return [path, value]
		})
	)
}

const rbxms = formatPath(
	import.meta.glob(['./common/*.rbxm', './common/2014L/*.rbxm'], {
		eager: true,
		query: '?raw',
		import: 'default'
	})
)

const commonAssets = formatPath(
	import.meta.glob(['./common/*.png', './common/*.midi', './common/templates/*.rbxl'], {
		eager: true,
		query: '?arraybuffer',
		import: 'default'
	})
)

const assetSchema = z.number().int().positive()

function getCdnUrl(hash: string) {
	for (var t = 31, n = 0; n < hash.length; n++) t ^= hash[n].charCodeAt(0)
	return 'https://c'.concat((t % 8).toString(), '.rbxcdn.com/').concat(hash)
}

export const GET: RequestHandler = async (event) => {
	const result = await assetSchema.safeParseAsync(Number(event.url.searchParams.get('id')))

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const assetId = result.data

	const corescript = luas[assetId]
	if (corescript) {
		return text(corescript)
	}

	const asset = commonAssets[assetId]
	if (asset) {
		return new Response(asset, {
			status: 200,
			headers: {
				'Content-Type': 'application/octet-stream',
				'Content-Disposition': `attachment; filename*=UTF-8''${assetId}`
			}
		})
	}

	const rbxm = rbxms[assetId]
	if (rbxm) {
		return text(rbxm)
	}

	const existingAsset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, assetId),
		columns: {
			assetType: true,
			simpleasseturl: true,
			moderationstate: true,
			associatedimageid: true,
			creatoruserid: true
		},
		with: {
			place: {
				columns: {
					placeurl: true
				}
			}
		}
	})

	if (existingAsset && existingAsset?.moderationstate !== 'approved') {
		return error(400, {
			success: false,
			message: 'This asset is not approved.',
			data: {}
		})
	}

	if (
		existingAsset?.assetType === 'audio' ||
		existingAsset?.assetType === 'images' ||
		existingAsset?.assetType === 'hats' ||
		existingAsset?.assetType === 'faces' ||
		existingAsset?.assetType === 'gears'
	) {
		redirect(302, `https://${s3Url}/${existingAsset.assetType}/` + existingAsset?.simpleasseturl)
	}

	if (existingAsset?.assetType === 'shirts') {
		return text(
			shirtTemplate.replace(
				'{1}',
				'http://' + env.BASE_URL + '/asset?id=' + existingAsset.associatedimageid
			)
		)
	}

	if (existingAsset?.assetType === 'pants') {
		return text(
			pantsTemplate.replace(
				'{1}',
				'http://' + env.BASE_URL + '/asset?id=' + existingAsset.associatedimageid
			)
		)
	}

	if (existingAsset?.assetType === 'decals') {
		return text(
			decalTemplate.replace(
				'{1}',
				'http://' + env.BASE_URL + '/asset?id=' + existingAsset.associatedimageid
			)
		)
	}

	if (existingAsset?.assetType === 't-shirts') {
		return text(
			tshirtTemplate.replace(
				'{1}',
				'http://' + env.BASE_URL + '/asset?id=' + existingAsset.associatedimageid
			)
		)
	}

	if (existingAsset?.assetType === 'games') {
		// authenticate this
		const accessKey = event.url.searchParams.get('apikey')

		if (!accessKey || (env.RCC_ACCESS_KEY as string) !== accessKey) {
			event.locals.auth = auth.handleRequest(event)

			const session = await event.locals.auth.validate()

			if (session?.user?.userid != existingAsset.creatoruserid) {
				return error(403, {
					success: false,
					message: "You don't have permission to access this asset.",
					data: {}
				})
			}
		}

		redirect(302, `https://${s3Url}/${existingAsset?.assetType}/` + existingAsset?.place.placeurl)
	}

	if (existingAsset?.assetType === 'packages') {
		return error(403, {
			success: false,
			message: "You don't have permission to access this asset.",
			data: {}
		})
	}

	if (
		existingAsset?.assetType === 'heads' ||
		existingAsset?.assetType === 'l arms' ||
		existingAsset?.assetType === 'l legs' ||
		existingAsset?.assetType === 'r arms' ||
		existingAsset?.assetType === 'r legs' ||
		existingAsset?.assetType === 'torsos'
	) {
		redirect(302, `https://${s3Url}/${'packages'}/` + existingAsset?.simpleasseturl)
	}

	const cachedAsset = await db
		.select({ filehash: assetCacheTable.filehash, assettypeid: assetCacheTable.assettypeid })
		.from(assetCacheTable)
		.where(eq(assetCacheTable.assetid, assetId))
		.limit(1)

	const meshAssetId = 4

	if (cachedAsset?.[0]?.filehash && cachedAsset?.[0]?.assettypeid != meshAssetId) {
		redirect(302, getCdnUrl(cachedAsset[0].filehash))
	} else {
		const response = await fetch('https://assetdelivery.roblox.com/v2/assetId/' + assetId, {
			headers: { 'User-Agent': 'Roblox/WinInet' }
		})
		const data = await response.json()

		if (data) {
			if (data.locations?.length > 0) {
				const url = data.locations[0].location
				const filehash = url.substring(22)

				if (data.assetTypeId === meshAssetId) {
					const assetResponse = await fetch(url, {
						headers: { 'User-Agent': 'Roblox/WinInet' }
					})
					const assetData = await assetResponse.arrayBuffer()

					return new Response(
						parse(Buffer.from(assetData)) ?? assetData /* parse returns nothing if mesh is old */,
						{
							status: 200,
							headers: {
								'Content-Type': 'application/octet-stream',
								'Content-Disposition': `attachment; filename*=UTF-8''${filehash}`
							}
						}
					)
				}

				if (cachedAsset.length === 0) {
					await db.insert(assetCacheTable).values({
						assetid: assetId,
						filehash,
						assettypeid: data.assetTypeId
					}) // maybe we should cache converted meshes later as well?
				}

				redirect(302, url)
			}
		}

		redirect(302, 'https://assetdelivery.roblox.com/v1/asset/?id=' + assetId)
	}
}
