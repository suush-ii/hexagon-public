import { db } from '$lib/server/db'
import { assetTable, assetThumbnailCacheTable, jobsTable, placesTable } from '$lib/server/schema'
import { getImage } from '$lib/games/getImage'
import { imageSql } from '$lib/server/games/getImage'
import { type RequestHandler, redirect, error } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { s3Url } from '$src/stores'
import { z } from 'zod'
import { env } from '$env/dynamic/private'
import audio from '$lib/icons/audio.png'
const assetSchema = z.number().int().positive()

export const GET: RequestHandler = async ({ url }) => {
	const result = await assetSchema.safeParseAsync(
		Number(url.searchParams.get('AssetID') ?? url.searchParams.get('assetId'))
	)

	if (!result.success) {
		error(400, { success: false, message: 'Malformed ID.', data: {} })
	}

	const assetId = result.data

	const cachedAsset = await db
		.select({ filehash: assetThumbnailCacheTable.filehash })
		.from(assetThumbnailCacheTable)
		.where(eq(assetThumbnailCacheTable.assetid, assetId))
		.limit(1)

	if (cachedAsset.length > 0) {
		if (cachedAsset[0].filehash === '180DAY-cf6ebcadd5f361127dcdd159743b15af') {
			// script

			return redirect(302, '/Thumbs/Script.png')
		}

		redirect(302, `https://tr.rbxcdn.com/${cachedAsset[0].filehash}/700/700/Model/Png/noFilter`)
	}

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, assetId),
		columns: {},
		with: {
			associatedgame: {
				columns: {},
				with: {
					thumbnail: {
						columns: {
							moderationstate: true
						},
						extras: {
							simpleasseturl: imageSql
						}
					}
				}
			}
		}
	})

	if (place) {
		return redirect(
			302,
			getImage(
				place.associatedgame.thumbnail?.simpleasseturl,
				place.associatedgame.thumbnail?.moderationstate,
				'thumbnail'
			)
		)
	}

	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, assetId),
		// for ingame purchase prompt
		columns: {
			moderationstate: true,
			assetType: true
		},
		extras: {
			simpleasseturl:
				sql`CASE WHEN ${assetTable.moderationstate} = 'approved' THEN ${assetTable.assetrender} ELSE NULL END`.as(
					'simpleasseturl'
				)
		},
		with: {
			associatedImage: {
				columns: {
					assetid: true,
					assetType: true
				},
				extras: {
					simpleasseturl: imageSql
				}
			}
		}
	})

	if (asset) {
		if (asset.associatedImage) {
			return redirect(
				302,
				`https://${s3Url}/${asset.associatedImage?.assetType}/${asset.associatedImage?.simpleasseturl}`
			)
		}

		if (asset.assetType === 'audio') {
			return redirect(302, audio)
		}

		if (!asset?.simpleasseturl) {
			const [instanceNew] = await db
				.insert(jobsTable)
				.values({
					associatedid: assetId,
					type: 'render',
					clientversion: '2014',
					rendertype: 'asset'
				})
				.returning({ jobid: jobsTable.jobid })

			await fetch(`http://${env.RENDER_HOST}/openrenderasset2016`, {
				method: 'POST',
				body: JSON.stringify({
					jobid: instanceNew.jobid,
					associatedid: assetId.toString(),
					headshot: false,
					obj: false,
					itemtype: asset.assetType,
					returnimg: false
				})
			})
		}

		return redirect(302, getImage(asset?.simpleasseturl, asset.moderationstate, 'icon', true))
	}

	const res = await fetch(
		'https://thumbnails.roblox.com/v1/assets?assetids=' +
			assetId +
			'&size=700x700&format=Png&isCircular=false'
	)
	const json = await res.json()
	if (json?.data?.[0]?.imageUrl) {
		await db.insert(assetThumbnailCacheTable).values({
			assetid: assetId,
			filehash: json.data[0].imageUrl.split('/')[3]
		})

		if (
			json.data[0].imageUrl ===
			'https://tr.rbxcdn.com/180DAY-cf6ebcadd5f361127dcdd159743b15af/700/700/Model/Png'
		) {
			// script

			return redirect(302, '/Thumbs/Script.png')
		}

		redirect(302, json.data[0].imageUrl)
	}

	error(400, { success: false, message: 'Malformed ID.', data: {} })
}
