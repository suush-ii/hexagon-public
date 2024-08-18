import type { PageServerLoad } from './$types'
import { _assetSchema } from './+layout.server'
import { db } from '$lib/server/db'
import { gamesTable, placesTable } from '$lib/server/schema/games'
import { assetTable } from '$lib/server/schema/assets'
import { eq, and, desc, count } from 'drizzle-orm'
import { error } from '@sveltejs/kit'
import { s3Url } from '$src/stores'
import pending from '$lib/icons/iconpending.png'
import rejected from '$lib/icons/iconrejected.png'
import audio from '$lib/icons/audio.png'
import { getPageNumber } from '$lib/utils'
import { env } from '$env/dynamic/private'
import { imageSql } from '$lib/server/games/getImage'
import type { assetStates } from '$lib/types'

async function last7days(universeid: number) {
	const places = await db.query.placesTable.findMany({
		where: eq(placesTable.universeid, universeid),
		columns: {},
		with: {
			associatedasset: {
				columns: {
					last7dayscounter: true,
					lastweekreset: true,
					assetid: true
				}
			}
		}
	})

	const now = new Date().valueOf()
	for (const _place of places) {
		const place = _place.associatedasset
		if (
			now - place.lastweekreset.valueOf() >
			7 * 24 * 60 * 60 * 1000 // 7 days
		) {
			await db
				.update(assetTable)
				.set({ last7dayscounter: 0 })
				.where(eq(assetTable.assetid, place.assetid))

			await db
				.update(assetTable)
				.set({ lastweekreset: new Date() })
				.where(eq(assetTable.assetid, place.assetid))
		}
	} // force stats to update here as well

	const last7days = places.reduce((acc, place) => acc + place.associatedasset.last7dayscounter, 0)

	return last7days
}

async function last7daysasset(last7dayscounter: number, lastweekreset: Date, assetid: number) {
	const now = new Date().valueOf()

	if (
		now - lastweekreset.valueOf() >
		7 * 24 * 60 * 60 * 1000 // 7 days
	) {
		await db.update(assetTable).set({ last7dayscounter: 0 }).where(eq(assetTable.assetid, assetid))

		await db
			.update(assetTable)
			.set({ lastweekreset: new Date() })
			.where(eq(assetTable.assetid, assetid))

		return 0
	}

	return last7dayscounter
}

export const load: PageServerLoad = async ({ params, locals, url, cookies }) => {
	const result = await _assetSchema.safeParseAsync(params.item)

	if (result.success === false) {
		error(404, { success: false, message: 'Not found.' })
	}

	let page = getPageNumber(url)

	const size = 28

	let itemscount

	let creations: {
		assetName: string
		assetid: number
		placeid?: number
		assetType: string
		updated: Date
		iconUrl?: string | null | unknown
		iconModerationState?: assetStates
		totalStat: number
		last7DaysStat: number
	}[] = []

	if (params.item === 'games') {
		itemscount = await db
			.select({ count: count() })
			.from(gamesTable)
			.where(eq(gamesTable.creatoruserid, locals.user.userid))
			.limit(1)

		if (itemscount[0].count < (page - 1) * size) {
			page = 1
		}

		const gamecreations = await db.query.gamesTable.findMany({
			where: eq(gamesTable.creatoruserid, locals.user.userid),
			orderBy: desc(gamesTable.updated),
			limit: size,
			offset: (page - 1) * size,
			columns: {
				universeid: true,
				updated: true,
				visits: true
			},
			with: {
				places: {
					columns: {
						placeid: true,
						placename: true
					},
					where: eq(placesTable.startplace, true),
					limit: 1
				},
				icon: {
					columns: {
						moderationstate: true
					},
					extras: {
						simpleasseturl: imageSql
					}
				}
			}
		})

		creations = await Promise.all(
			gamecreations.map(async (game) => ({
				assetName: game.places[0].placename,
				assetid: game.universeid,
				placeid: game.places[0].placeid,
				iconUrl: game.icon?.simpleasseturl,
				iconModerationState: game.icon?.moderationstate,
				updated: game.updated,
				assetType: params.item,
				totalStat: game.visits,
				last7DaysStat: await last7days(game.universeid)
			}))
		)
	}

	if (
		params.item === 'audio' ||
		params.item === 'decals' ||
		params.item === 'shirts' ||
		params.item === 'pants' ||
		params.item === 't-shirts'
	) {
		itemscount = await db
			.select({ count: count() })
			.from(assetTable)
			.where(
				and(eq(assetTable.creatoruserid, locals.user.userid), eq(assetTable.assetType, params.item))
			)
			.limit(1)

		if (itemscount[0].count < (page - 1) * size) {
			page = 1
		}

		// default asset
		const assetcreations = await db.query.assetTable.findMany({
			where: and(
				eq(assetTable.creatoruserid, locals.user.userid),
				eq(assetTable.assetType, params.item)
			),
			with: {
				associatedImage: {
					columns: {
						simpleasseturl: true,
						last7dayscounter: true,
						lastweekreset: true
					}
				}
			},
			orderBy: desc(assetTable.created),
			limit: size,
			offset: (page - 1) * size
		})

		creations = await Promise.all(
			assetcreations.map(async (asset) => ({
				assetName: asset.assetname,
				assetid: asset.assetid,
				iconUrl:
					asset.moderationstate === 'pending'
						? pending
						: asset.moderationstate === 'rejected'
							? rejected
							: asset.assetType === 'decals'
								? `https://${s3Url}/images/` + asset?.associatedImage?.simpleasseturl
								: asset.assetType === 'audio'
									? audio
									: null, //TODO: make an audio default icon
				updated: asset.created,
				assetType: params.item,
				totalStat: asset.sales,
				last7DaysStat: await last7daysasset(
					asset.last7dayscounter,
					asset.lastweekreset,
					asset.assetid
				)
			}))
		)
	}

	const authBearer = cookies.get('.ROBLOSECURITY') ?? ''

	return {
		creations,
		params: params.item,
		itemcount: itemscount?.[0]?.count ?? 0,
		authBearer,
		baseurl: env.BASE_URL
	}
}
