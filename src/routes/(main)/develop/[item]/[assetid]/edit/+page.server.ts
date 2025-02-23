import { error, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from 'sveltekit-superforms/server'
import { formSchema as gameSchema } from '$src/lib/schemas/edit/editgameschema'
import { formSchema as clothingSchema } from '$src/lib/schemas/edit/editclothingschema'
import { formSchema as assetSchema } from '$src/lib/schemas/edit/editassetschema'
import { formSchema as gameImageSchema } from '$src/lib/schemas/edit/game/editimageschema'
import { formSchema as badgeSchema } from '$src/lib/schemas/edit/editbadgeschema'
import { formSchema as gamepassSchema } from '$src/lib/schemas/edit/editgamepassschema'
import { formSchema as userAdSchema } from '$src/lib/schemas/edit/edituseradschema'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'
import { assetTable, gamesTable, placesTable, userAdsTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { and, desc, eq } from 'drizzle-orm'
import { _assetSchema } from '../../+layout.server'
import type { AssetGenreDB, assetStates, GearAttributes, clientVersions } from '$lib/types'
import { uploadAsset } from '$lib/server/develop/uploadasset'
import { imageSql } from '$lib/server/games/getImage'
import { shutdown } from '$src/lib/server/games/shutdown'

export const load: PageServerLoad = async ({ params, locals }) => {
	const result = await z.number().safeParseAsync(Number(params.assetid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	let name = ''
	let description = ''
	let onsale = true
	let price = 0
	let genres: AssetGenreDB[] = []
	let gearattributes: GearAttributes[] = []
	let serversize = 0
	let clientversion: clientVersions = '2014'
	let places: {
		placeid: number
		startplace: boolean
		placename: string
		associatedgame: {
			thumbnail: {
				simpleasseturl: unknown
				moderationstate: assetStates | null
			} | null
		}
	}[] = []

	if (params.item === 'games') {
		const game = await db.query.gamesTable.findFirst({
			columns: {
				description: true,
				creatoruserid: true,
				genre: true,
				serversize: true,
				clientversion: true
			},
			with: {
				places: {
					columns: {
						placeid: true,
						startplace: true,
						placename: true
					},
					orderBy: desc(placesTable.startplace),
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
				}
			},
			where: eq(gamesTable.universeid, result.data)
		})

		if (!game) {
			error(404, { success: false, message: 'Game not found.' })
		}

		if (game.creatoruserid !== Number(locals.user.userid)) {
			error(403, { success: false, message: 'You do not have permission to edit this game.' })
		}

		name = game.places[0].placename
		description = game.description
		genres[0] = game.genre
		serversize = game.serversize
		places = game.places
		clientversion = game.clientversion
	}

	if (
		params.item === 'audio' ||
		params.item === 'decals' ||
		params.item === 'shirts' ||
		params.item === 'pants' ||
		params.item === 't-shirts' ||
		params.item === 'badges' ||
		params.item === 'gamepasses' ||
		params.item === 'models' ||
		params.item === 'animations'
	) {
		const asset = await db
			.select({
				assetname: assetTable.assetname,
				description: assetTable.description,
				creatoruserid: assetTable.creatoruserid,
				moderationstate: assetTable.moderationstate,
				onsale: assetTable.onsale,
				price: assetTable.price,
				genres: assetTable.genres,
				assettype: assetTable.assetType,
				gearattributes: assetTable.gearattributes
			})
			.from(assetTable)
			.where(eq(assetTable.assetid, result.data))
			.limit(1)

		if (asset.length === 0 || asset[0].assettype !== params.item) {
			error(404, { success: false, message: 'Asset not found.' })
		}

		if (asset[0].creatoruserid !== Number(locals.user.userid)) {
			error(403, { success: false, message: 'You do not have permission to edit this asset.' })
		}

		if (asset[0].moderationstate === 'rejected') {
			error(403, { success: false, message: 'This asset has been moderated.' })
		}

		name = asset[0].assetname
		description = asset[0].description ?? ''
		onsale = asset[0].onsale
		price = asset[0].price ?? 0
		genres = asset[0].genres
		gearattributes = asset[0].gearattributes ?? []
	}

	if (params.item === 'userads') {
		const ad = await db.query.userAdsTable.findFirst({
			where: eq(userAdsTable.useradid, result.data),
			columns: {
				assetname: true,
				creatoruserid: true
			}
		})

		if (!ad) {
			error(404, { success: false, message: 'Ad not found.' })
		}

		if (ad.creatoruserid != locals.user.userid) {
			error(403, { success: false, message: 'You do not have permission to edit this ad.' })
		}

		name = ad.assetname
	}

	const gameForm = await superValidate(zod(gameSchema))
	const clothingForm = await superValidate(zod(clothingSchema))
	const assetForm = await superValidate(zod(assetSchema))
	const gameImageForm = await superValidate(zod(gameImageSchema))
	const badgeForm = await superValidate(zod(badgeSchema))
	const gamepassForm = await superValidate(zod(gamepassSchema))
	const userAdForm = await superValidate(zod(userAdSchema))

	return {
		gameForm,
		clothingForm,
		assetForm,
		gameImageForm,
		badgeForm,
		gamepassForm,
		assetid: result.data,
		assetname: name,
		description,
		onsale,
		price,
		genres,
		gearattributes,
		serversize,
		places,
		clientversion,
		userAdForm
	}
}

async function updateAsset(
	description: string,
	onsale: boolean,
	price: number,
	genres: AssetGenreDB[],
	assetname: string,
	assetid: number,
	creatoruserid: number
) {
	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, assetid),
		columns: {
			creatoruserid: true,
			moderationstate: true
		}
	})

	if (!asset) {
		error(404, { success: false, message: 'Asset not found.' })
	}

	if (asset.creatoruserid != creatoruserid) {
		error(403, { success: false, message: 'You do not have permission to edit this asset.' })
	}

	if (asset.moderationstate === 'rejected') {
		error(403, { success: false, message: 'This asset has been moderated.' })
	}

	await db
		.update(assetTable)
		.set({
			description,
			onsale,
			price,
			genres,
			assetname,
			updated: new Date()
		})
		.where(eq(assetTable.assetid, assetid))
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

		const game = await db.query.gamesTable.findFirst({
			columns: {
				creatoruserid: true,
				clientversion: true
			},
			where: eq(gamesTable.universeid, Number(params.assetid))
		})

		if (!game) {
			return fail(404, { form })
		}

		if (game.creatoruserid != locals.user.userid) {
			return fail(403, { form })
		}

		const data = form.data

		if (data.clientversion !== game.clientversion) {
			await shutdown(Number(params.assetid))
		}

		await db
			.update(gamesTable)
			.set({
				description: data.description,
				serversize: data.serversize,
				genre: data.genre,
				clientversion: data.clientversion
			})
			.where(eq(gamesTable.universeid, Number(params.assetid)))

		await db
			.update(placesTable)
			.set({ placename: data.name })
			.where(
				and(eq(placesTable.universeid, Number(params.assetid)), eq(placesTable.startplace, true))
			)

		return { form }
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

		const data = form.data

		await updateAsset(
			data.description,
			data.onsale,
			data.price,
			data.genres,
			data.name,
			Number(params.assetid),
			locals.user.userid
		)

		return { form }
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

		const data = form.data

		await updateAsset(
			data.description,
			data.onsale,
			data.price,
			data.genres,
			data.name,
			Number(params.assetid),
			locals.user.userid
		)

		return { form }
	},
	gameimage: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod(gameImageSchema))

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

		const game = await db
			.select({ gamename: placesTable.placename, creatoruserid: gamesTable.creatoruserid })
			.from(gamesTable)
			.leftJoin(
				placesTable,
				and(eq(placesTable.universeid, gamesTable.universeid), eq(placesTable.startplace, true))
			)
			.where(eq(gamesTable.universeid, Number(params.assetid)))
			.limit(1)

		if (game[0].creatoruserid != locals.user.userid) {
			return fail(403, { form })
		}

		const assetid = await uploadAsset(
			file,
			'images',
			form,
			locals.user.userid,
			`${locals.user.username}'s Place: ${game[0].gamename}_Image`
		)

		if (form.data.type === 'icon') {
			await db
				.update(gamesTable)
				.set({
					iconid: Number(assetid),
					updated: new Date()
				})
				.where(eq(gamesTable.universeid, Number(params.assetid)))
		} else {
			await db
				.update(gamesTable)
				.set({
					thumbnailid: Number(assetid),
					updated: new Date()
				})
				.where(eq(gamesTable.universeid, Number(params.assetid)))
		}

		return message(form, 'Done!')
	},
	badge: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(badgeSchema))

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

		const data = form.data

		await updateAsset(
			data.description,
			false,
			0,
			['All'],
			data.name,
			Number(params.assetid),
			locals.user.userid
		)

		return { form }
	},
	gamepass: async ({ request, params, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, zod(gamepassSchema))

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

		const data = form.data

		await updateAsset(
			data.description,
			data.onsale,
			data.price,
			['All'],
			data.name,
			Number(params.assetid),
			locals.user.userid
		)

		return { form }
	},
	userad: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod(userAdSchema))

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

		const asset = await db.query.userAdsTable.findFirst({
			where: eq(userAdsTable.useradid, Number(params.assetid)),
			columns: {
				creatoruserid: true
			}
		})

		if (!asset) {
			error(404, { success: false, message: 'Asset not found.' })
		}

		if (asset.creatoruserid != asset.creatoruserid) {
			error(403, { success: false, message: 'You do not have permission to edit this asset.' })
		}

		await db
			.update(userAdsTable)
			.set({
				assetname: form.data.name
			})
			.where(eq(userAdsTable.useradid, Number(params.assetid)))
	}
}
