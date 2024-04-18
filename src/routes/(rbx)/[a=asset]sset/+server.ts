import { type RequestHandler, error, redirect, json, text } from '@sveltejs/kit'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { assetTable, assetCacheTable } from '$lib/server/schema/assets'
import { eq } from 'drizzle-orm'
import { s3Url } from '$src/stores'
import { CLIENT_PRIVATE_KEY, RCC_ACCESS_KEY, BASE_URL } from '$env/static/private'
//import parse from './meshconvert/index'
import { createSign } from 'node:crypto'
import pantsTemplate from './templates/pantsTemplate.xml?raw'
import shirtTemplate from './templates/shirtTemplate.xml?raw'
import decalTemplate from './templates/decalTemplate.xml?raw'

export const trailingSlash = 'ignore'
let luas = formatPath(
	import.meta.glob(['./common/*.lua', './common/2014L/*.lua'], {
		eager: true,
		query: '?raw',
		import: 'default'
	})
)

luas = Object.fromEntries(
	Object.entries(luas).map(([key, corescript]) => {
		corescript = `--rbxassetid%${key}%\r` + corescript
		const sign = createSign('SHA1')
		sign.update('\r\n' + corescript)

		const signature = sign.sign(CLIENT_PRIVATE_KEY, 'base64')

		corescript = '--rbxsig%' + signature + '%\r\n' + corescript
		return [key, corescript]
	})
)

function formatPath(glob: Record<string, unknown>) {
	return Object.fromEntries(
		Object.entries(glob).map(([key, value]) => {
			const path = key?.split('/')?.at(-1)?.split('.')[0]
			return [path, value]
		})
	)
}

let commonAssets = formatPath(
	import.meta.glob(
		[
			'./common/*.rbxm',
			'./common/*.mp3',
			'./common/*.png',
			'./common/*.wav',
			'./common/*.mp3',
			'./common/*.midi',
			'./common/2014L/*.rbxm'
		],
		{
			eager: true,
			query: '?raw',
			import: 'default'
		}
	)
)

const assetSchema = z.number().int().positive()

function getCdnUrl(hash: string) {
	for (var t = 31, n = 0; n < hash.length; n++) t ^= hash[n].charCodeAt(0)
	return 'https://c'.concat((t % 8).toString(), '.rbxcdn.com/').concat(hash)
}

export const GET: RequestHandler = async ({ url, request }) => {
	const result = await assetSchema.safeParseAsync(Number(url.searchParams.get('id')))

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

	const existingAsset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, assetId),
		columns: {
			assetType: true,
			simpleasseturl: true,
			moderationstate: true,
			associatedimageid: true
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

	if (existingAsset?.assetType === 'audio' || existingAsset?.assetType === 'images') {
		redirect(302, `https://${s3Url}/${existingAsset.assetType}/` + existingAsset?.simpleasseturl)
	}

	if (existingAsset?.assetType === 'shirts') {
		return text(
			shirtTemplate.replace(
				'{1}',
				'http://' + BASE_URL + '/asset?id=' + existingAsset.associatedimageid
			)
		)
	}

	if (existingAsset?.assetType === 'pants') {
		return text(
			pantsTemplate.replace(
				'{1}',
				'http://' + BASE_URL + '/asset?id=' + existingAsset.associatedimageid
			)
		)
	}

	if (existingAsset?.assetType === 'decals') {
		return text(
			decalTemplate.replace(
				'{1}',
				'http://' + BASE_URL + '/asset?id=' + existingAsset.associatedimageid
			)
		)
	}

	if (existingAsset?.assetType === 'games') {
		// authenticate this
		const accessKey = url.searchParams.get('accessKey')

		if (!accessKey || RCC_ACCESS_KEY != accessKey) {
			return error(400, {
				success: false,
				message: "You don't have permission to access this asset.",
				data: {}
			})
		}

		redirect(302, `https://${s3Url}/${existingAsset?.assetType}/` + existingAsset?.place.placeurl)
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

				/*if (data.assetTypeId === meshAssetId) {
					const assetResponse = await fetch(url, {
						headers: { 'User-Agent': 'Roblox/WinInet' }
					})
					const assetData = await assetResponse.arrayBuffer()

					return new Response(
						parse(Buffer.from(assetData)) ?? assetData /* parse returns nothing if mesh is old ,
						{
							status: 200,
							headers: {
								'Content-Type': 'application/octet-stream',
								'Content-Disposition': `attachment; filename*=UTF-8''${filehash}`
							}
						}
					)*/
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
	}

	redirect(302, 'https://assetdelivery.roblox.com/v1/asset/?id=' + assetId)
}
