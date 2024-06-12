import { error, fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from 'sveltekit-superforms/server'
import { formSchema as gameSchema } from '$src/lib/schemas/edit/editgameschema'
import { formSchema as clothingSchema } from '$src/lib/schemas/edit/editclothingschema'
import { formSchema as assetSchema } from '$src/lib/schemas/edit/editassetschema'
import { formSchema as gameImageSchema } from '$src/lib/schemas/edit/game/editimageschema'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'
import { assetTable, gamesTable, placesTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { and, eq } from 'drizzle-orm'
import { _assetSchema } from '../../+layout.server'
import type { AssetGenreDB, GearAttributes } from '$lib/types'
import { uploadAsset } from '$lib/server/develop/uploadasset'

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
	let places: {
		placeid: number
		startplace: boolean
		associatedgame: {
			thumbnailid: number | null
		}
	}[] = []

	if (params.item === 'games') {
		const game = await db.query.gamesTable.findFirst({
			columns: {
				gamename: true,
				description: true,
				creatoruserid: true,
				genre: true,
				serversize: true
			},
			with: {
				places: {
					columns: {
						placeid: true,
						startplace: true
					},
					orderBy: placesTable.startplace,
					with: {
						associatedgame: {
							columns: {
								thumbnailid: true
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

		name = game.gamename
		description = game.description
		genres[0] = game.genre
		serversize = game.serversize
		places = game.places
	}

	if (
		params.item === 'audio' ||
		params.item === 'decals' ||
		params.item === 'shirts' ||
		params.item === 'pants'
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

	const gameForm = await superValidate(zod(gameSchema))
	const clothingForm = await superValidate(zod(clothingSchema))
	const assetForm = await superValidate(zod(assetSchema))
	const gameImageForm = await superValidate(zod(gameImageSchema))

	return {
		gameForm,
		clothingForm,
		assetForm,
		gameImageForm,
		assetid: result.data,
		assetname: name,
		description,
		onsale,
		price,
		genres,
		gearattributes,
		serversize,
		places
	}
}

async function updateAsset(
	description: string,
	onsale: boolean,
	price: number,
	genres: AssetGenreDB[],
	assetname: string,
	assetid: number
) {
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

		const data = form.data

		await db
			.update(gamesTable)
			.set({
				description: data.description,
				serversize: data.serversize,
				gamename: data.name,
				genre: data.genre
			})
			.where(eq(gamesTable.universeid, Number(params.assetid)))

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
			Number(params.assetid)
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
			Number(params.assetid)
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

		let game = await db
			.select({ gamename: gamesTable.gamename })
			.from(gamesTable)
			.where(eq(gamesTable.universeid, Number(params.assetid)))
			.limit(1)

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
	}
}
