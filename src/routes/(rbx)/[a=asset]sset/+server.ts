import { type RequestHandler, error, redirect, text } from '@sveltejs/kit'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { assetTable, assetCacheTable, assetVersionCacheTable } from '$lib/server/schema/assets'
import { eq } from 'drizzle-orm'
import { s3Url } from '$src/stores'
import { env } from '$env/dynamic/private'
import parse from 'meshconvert'
import { createSign } from 'node:crypto'
import pantsTemplate from './templates/pantsTemplate.xml?raw'
import audioTemplate from './templates/audioTemplate.xml?raw'
import shirtTemplate from './templates/shirtTemplate.xml?raw'
import tshirtTemplate from './templates/tshirtTemplate.xml?raw'
import decalTemplate from './templates/decalTemplate.xml?raw'
import { building } from '$app/environment'
import { auth } from '$lib/server/lucia'
import * as jose from 'jose'
import { jobsTable } from '$lib/server/schema'
import rbxmParse from 'rbxmconvert'

const meshAssetId = 4
const hatAssetId = 8
const faceAssetId = 18
const gearAssetId = 18
const animationAssetId = 24
const modelAssetId = 10

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

const assetSchema = z.coerce.number().int().positive()

function getCdnUrl(hash: string, token: string) {
	for (var t = 31, n = 0; n < hash.length; n++) t ^= hash[n].charCodeAt(0)
	return 'https://sc'
		.concat((t % 8).toString(), '.rbxcdn.com/')
		.concat(hash)
		.concat(token)
}

async function parseMesh(url: string, filehash: string) {
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

async function parseRbxm(url: string, assetid: number) {
	const assetResponse = await fetch(url, {
		headers: { 'User-Agent': 'Roblox/WinInet' }
	})
	const assetData = await assetResponse.arrayBuffer()

	return new Response(
		rbxmParse(Buffer.from(assetData)) ?? assetData /* parse returns nothing if mesh is old */,
		{
			status: 200,
			headers: {
				'Content-Type': 'application/octet-stream',
				'Content-Disposition': `attachment; filename*=UTF-8''${assetid}`
			}
		}
	)
}

export const GET: RequestHandler = async (event) => {
	const result = await assetSchema.safeParseAsync(
		event.url.searchParams.get('id') ?? event.url.searchParams.get('studioid')
	)

	if (!result.success) {
		const assetVersionResult = await assetSchema.safeParseAsync(
			event.url.searchParams.get('assetversionid') ?? event.url.searchParams.get('versionid')
		)

		if (assetVersionResult.success) {
			const versionId = assetVersionResult.data

			const cachedAsset = await db.query.assetVersionCacheTable.findFirst({
				where: eq(assetVersionCacheTable.assetversionid, versionId),
				columns: {
					filehash: true,
					assettypeid: true,
					token: true,
					expiration: true
				}
			})

			if (cachedAsset && cachedAsset?.expiration < new Date()) {
				await db
					.delete(assetVersionCacheTable)
					.where(eq(assetVersionCacheTable.assetversionid, versionId))
			}

			if (cachedAsset?.filehash && cachedAsset?.expiration > new Date()) {
				redirect(302, getCdnUrl(cachedAsset.filehash, cachedAsset.token))
			} else {
				const response = await fetch(
					'https://assetdelivery.roblox.com/v2/asset/?assetversionid=' + versionId,
					{
						headers: { 'User-Agent': 'Roblox/WinInet' }
					}
				)
				const data = await response.json()

				if (data) {
					if (data.locations?.length > 0) {
						const url = data.location
						const filehash = new URL(url).pathname.replace('/', '')

						const query = new URL(url).searchParams

						const token = new URL(url).search

						const expires = Number(query.get('Expires')) * 1000

						if ((!cachedAsset || cachedAsset?.expiration < new Date()) && token && expires) {
							await db
								.insert(assetVersionCacheTable)
								.values({
									assetversionid: versionId,
									filehash,
									assettypeid: data.assetTypeId,
									token,
									expiration: new Date(expires)
								})
								.onConflictDoNothing() // maybe we should cache converted meshes later as well?
						}

						if (data.assetTypeId === meshAssetId) {
							return parseMesh(url, filehash)
						}

						redirect(302, url)
					}
				}

				redirect(302, 'https://assetdelivery.roblox.com/v1/asset/?assetversionid=' + versionId)
			}
		}

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
		(existingAsset?.assetType === 'hats' ||
			existingAsset?.assetType === 'faces' ||
			existingAsset?.assetType === 'gears' ||
			existingAsset?.assetType === 'heads' ||
			existingAsset?.assetType === 'models') &&
		event.request.headers.get('user-agent') === '2013ox/WinInet'
	) {
		return parseRbxm(
			`https://${s3Url}/${existingAsset.assetType}/` + existingAsset?.simpleasseturl,
			assetId
		)
	}

	if (
		existingAsset?.assetType === 'audio' ||
		existingAsset?.assetType === 'images' ||
		existingAsset?.assetType === 'meshes' ||
		existingAsset?.assetType === 'models' ||
		existingAsset?.assetType === 'animations' ||
		existingAsset?.assetType === 'solidmodels'
	) {
		if (existingAsset?.assetType === 'audio') {
			if (!event.url.searchParams.get('id') && event.url.searchParams.get('studioid')) {
				return text(audioTemplate.replace('{1}', 'http://' + env.BASE_URL + '/asset?id=' + assetId))
			}
		}

		redirect(302, `https://${s3Url}/${existingAsset.assetType}/` + existingAsset?.simpleasseturl)
	}

	if (
		existingAsset?.assetType === 'hats' ||
		existingAsset?.assetType === 'faces' ||
		existingAsset?.assetType === 'gears' ||
		existingAsset?.assetType === 'heads'
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

		const accessKey =
			event.url.searchParams.get('apikey') ??
			event.cookies.get('.ROBLOSECURITY') ??
			event.request.headers.get('accesskey')

		try {
			const { payload } = await jose.jwtVerify(
				accessKey ?? '',
				new TextEncoder().encode(env.RCC_ACCESS_KEY as string)
			)

			const job = await db.query.jobsTable.findFirst({
				where: eq(jobsTable.jobid, (payload?.jobid ?? '') as string),
				columns: {
					placeid: true,
					status: true
				}
			})

			if (job?.status === 2) {
				console.log('Warning something sus.')
			}

			if (!job || job.placeid != assetId || job.status != 1) {
				return error(403, {
					success: false,
					message: 'Invalid session.',
					data: {}
				})
			}
		} catch {
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
		existingAsset?.assetType === 'l arms' ||
		existingAsset?.assetType === 'l legs' ||
		existingAsset?.assetType === 'r arms' ||
		existingAsset?.assetType === 'r legs' ||
		existingAsset?.assetType === 'torsos'
	) {
		redirect(302, `https://${s3Url}/${'packages'}/` + existingAsset?.simpleasseturl)
	}

	const cachedAsset = await db.query.assetCacheTable.findFirst({
		where: eq(assetCacheTable.assetid, assetId),
		columns: {
			filehash: true,
			assettypeid: true,
			token: true,
			expiration: true
		}
	})

	if (cachedAsset && cachedAsset?.expiration < new Date()) {
		await db.delete(assetCacheTable).where(eq(assetCacheTable.assetid, assetId))
	}

	if (cachedAsset?.filehash && cachedAsset?.expiration > new Date()) {
		const url = getCdnUrl(cachedAsset.filehash, cachedAsset.token)

		if (cachedAsset?.assettypeid == meshAssetId) {
			return parseMesh(url, cachedAsset.filehash)
		}

		if (
			(cachedAsset?.assettypeid == hatAssetId ||
				cachedAsset?.assettypeid == faceAssetId ||
				cachedAsset?.assettypeid == gearAssetId ||
				cachedAsset?.assettypeid == animationAssetId ||
				cachedAsset?.assettypeid == modelAssetId) &&
			event.request.headers.get('user-agent') === '2013ox/WinInet'
		) {
			return parseRbxm(url, assetId)
		}

		redirect(302, url)
	} else {
		const response = await fetch('https://assetdelivery.roblox.com/v1/assetId/' + assetId, {
			headers: { 'User-Agent': 'Roblox/WinInet' }
		})
		const data = await response.json()

		if (data) {
			if (data.location) {
				const url = data.location
				const filehash = new URL(url).pathname.replace('/', '')

				const query = new URL(url).searchParams

				const token = new URL(url).search

				const expires = Number(query.get('Expires')) * 1000

				if ((!cachedAsset || cachedAsset?.expiration < new Date()) && token && expires) {
					await db
						.insert(assetCacheTable)
						.values({
							assetid: assetId,
							filehash,
							assettypeid: data.assetTypeId,
							token,
							expiration: new Date(expires)
						})
						.onConflictDoNothing() // maybe we should cache converted meshes later as well?
				}

				if (data.assetTypeId === meshAssetId) {
					return parseMesh(url, filehash)
				}

				if (
					(data.assetTypeId === hatAssetId ||
						data.assetTypeId === faceAssetId ||
						data.assetTypeId === gearAssetId ||
						data.assetTypeId === animationAssetId ||
						data.assetTypeId === modelAssetId) &&
					event.request.headers.get('user-agent') === '2013ox/WinInet'
				) {
					return parseRbxm(url, assetId)
				}

				redirect(302, url)
			}
		}

		redirect(302, 'https://assetdelivery.roblox.com/v1/asset/?id=' + assetId)
	}
}
