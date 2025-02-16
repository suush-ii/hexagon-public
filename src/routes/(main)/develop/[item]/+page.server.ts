import type { PageServerLoad } from './$types'
import { _assetSchema } from './+layout.server'
import { db } from '$lib/server/db'
import {
	gamesTable,
	placesTable,
	transactionsTable,
	userAdsTable,
	usersTable
} from '$lib/server/schema'
import { assetTable } from '$lib/server/schema/assets'
import { eq, and, desc, count } from 'drizzle-orm'
import { error, type Actions } from '@sveltejs/kit'
import { s3Url } from '$src/stores'
import pending from '$lib/icons/iconpending.png'
import rejected from '$lib/icons/iconrejected.png'
import audio from '$lib/icons/audio.png'
import { getPageNumber } from '$lib/utils'
import { env } from '$env/dynamic/private'
import { imageSql } from '$lib/server/games/getImage'
import { formSchema as bidSchema } from '$src/lib/schemas/develop/bidschema'
import type { assetStates } from '$lib/types'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

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
		adStats:
			| {
					impressionscurrent: number
					impressionstotal: number
					clickscurrent: number
					clickstotal: number
					bid: number
					totalbid: number
					associatedname: string
					associatedassetid: number
					associatedassettype: string
					useradid: number
					bidexpires: Date
					moderationstate: assetStates
			  }
			| undefined
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
				last7DaysStat: await last7days(game.universeid),
				adStats: undefined
			}))
		)
	}

	if (params.item === 'userads') {
		itemscount = await db
			.select({ count: count() })
			.from(userAdsTable)
			.where(eq(userAdsTable.creatoruserid, locals.user.userid))
			.limit(1)

		if (itemscount[0].count < (page - 1) * size) {
			page = 1
		}

		const adCreations = await db.query.userAdsTable.findMany({
			where: eq(userAdsTable.creatoruserid, locals.user.userid),
			orderBy: desc(userAdsTable.created),
			limit: size,
			offset: (page - 1) * size,
			columns: {
				created: true,
				assetname: true,
				useradid: true,
				impressionscurrent: true,
				impressionstotal: true,
				clickscurrent: true,
				clickstotal: true,
				bid: true,
				totalbid: true,
				bidexpires: true
			},
			with: {
				associatedImage: {
					columns: {
						simpleasseturl: true,
						moderationstate: true
					}
				},
				associatedAsset: {
					columns: {
						assetname: true,
						assetid: true
					}
				},
				associatedGame: {
					columns: {},
					with: {
						places: {
							columns: {
								placeid: true,
								placename: true
							},
							where: eq(placesTable.startplace, true),
							limit: 1
						}
					}
				}
			}
		})

		creations = await Promise.all(
			adCreations.map(async (ad) => ({
				assetName: ad.assetname,
				assetid: ad.useradid,
				updated: ad.created,
				assetType: params.item,
				totalStat: 0,
				last7DaysStat: 0,
				adStats: {
					impressionscurrent: ad.impressionscurrent,
					impressionstotal: ad.impressionstotal,
					clickscurrent: ad.clickscurrent,
					clickstotal: ad.clickstotal,
					bid: ad.bid,
					totalbid: ad.totalbid,
					associatedname:
						ad?.associatedGame?.places[0]?.placename ?? ad?.associatedAsset?.assetname,
					associatedassetid: ad?.associatedGame?.places[0]?.placeid ?? ad.associatedAsset.assetid,
					associatedassettype: ad?.associatedGame?.places[0]?.placename ? 'games' : 'asset',
					useradid: ad.useradid,
					bidexpires: ad.bidexpires,
					moderationstate: ad.associatedImage.moderationstate
				},
				iconUrl:
					ad.associatedImage.moderationstate === 'pending'
						? pending
						: ad.associatedImage.moderationstate === 'rejected'
							? rejected
							: `https://${s3Url}/images/` + ad.associatedImage.simpleasseturl
			}))
		)
	}

	if (
		params.item === 'audio' ||
		params.item === 'decals' ||
		params.item === 'shirts' ||
		params.item === 'pants' ||
		params.item === 't-shirts' ||
		params.item === 'gamepasses' ||
		params.item === 'badges' ||
		params.item === 'models'
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
			orderBy: desc(assetTable.updated),
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
				updated: asset.updated,
				assetType: params.item,
				totalStat: asset.sales,
				last7DaysStat: await last7daysasset(
					asset.last7dayscounter,
					asset.lastweekreset,
					asset.assetid
				),
				adStats: undefined
			}))
		)
	}

	const authBearer = cookies.get('.ROBLOSECURITY') ?? ''

	return {
		creations,
		params: params.item,
		itemcount: itemscount?.[0]?.count ?? 0,
		authBearer,
		baseurl: env.BASE_URL,
		bidForm: await superValidate(zod(bidSchema))
	}
}

export const actions: Actions = {
	bid: async (event) => {
		const form = await superValidate(event, zod(bidSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { locals } = event

		const { bid, adId } = form.data

		const time = new Date()

		const ad = await db.query.userAdsTable.findFirst({
			where: and(
				eq(userAdsTable.useradid, adId),
				eq(userAdsTable.creatoruserid, event.locals.user.userid)
			),
			columns: {
				bid: true,
				totalbid: true,
				bidexpires: true
			},
			with: {
				associatedImage: {
					columns: {
						moderationstate: true
					}
				}
			}
		})

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.userid, locals.user.userid),
			columns: {
				coins: true
			}
		})

		if (!ad) {
			return fail(404, {
				form
			})
		}

		if (!user) {
			return fail(401, {
				form
			})
		}

		if (ad.associatedImage.moderationstate !== 'approved') {
			return setError(form, 'bid', "This ad isn't approved yet.")
		}

		if (user.coins < bid) {
			return setError(form, 'bid', 'You do not have enough coins.')
		}

		if (ad.bidexpires && ad.bidexpires > time) {
			return setError(form, 'bid', 'You already have a bid in place.')
		}

		await db.transaction(async (tx) => {
			await tx
				.update(userAdsTable)
				.set({
					bid,
					totalbid: ad.totalbid + bid,
					bidexpires: new Date(time.getTime() + 86400000), // 24 hours
					impressionscurrent: 0,
					clickscurrent: 0
				})
				.where(
					and(eq(userAdsTable.useradid, adId), eq(userAdsTable.creatoruserid, locals.user.userid))
				)

			const [newUser] = await tx // take away they mooners
				.update(usersTable)
				.set({ coins: user.coins - bid })
				.where(eq(usersTable.userid, locals.user.userid))
				.returning({ coins: usersTable.coins })

			if (newUser.coins < 0) {
				tx.rollback()
				return
			}

			await tx.insert(transactionsTable).values({
				userid: locals.user.userid,
				type: 'purchasebid',
				amount: bid,
				itemid: adId
			})
		})
	}
}
