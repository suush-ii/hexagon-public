import type { Actions, PageServerLoad } from './$types.js'
import { db } from '$lib/server/db'
import { and, eq } from 'drizzle-orm'
import { assetTable, jobsTable } from '$lib/server/schema'
import { error } from '@sveltejs/kit'
import { imageSql } from '$lib/server/games/getImage'
import { adminAssets } from '../../upload/[item]'

export const load: PageServerLoad = async ({ params }) => {
	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, Number(params.assetid)),
		columns: {
			moderationstate: true,
			assetname: true,
			assetid: true,
			created: true,
			assetType: true,
			creatoruserid: true
		},
		with: {
			place: {
				columns: {},
				with: {
					associatedgame: {
						columns: {},
						with: {
							icon: {
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
		}
	})

	if (!asset) {
		return error(404, { success: false, message: 'Asset not found.', data: {} })
	}

	let canEdit = false

	if (adminAssets.some((admin) => admin === asset.assetType) && asset.assetType !== 'packages') {
		canEdit = true
	}

	return {
		asset,
		canEdit
	}
}

export const actions: Actions = {
	render: async ({ params }) => {
		await db
			.update(assetTable)
			.set({
				assetrender: null,
				_3dmanifest: null
			})
			.where(eq(assetTable.assetid, Number(params.assetid)))

		await db
			.delete(jobsTable)
			.where(
				and(
					eq(jobsTable.associatedid, Number(params.assetid)),
					eq(jobsTable.type, 'render'),
					eq(jobsTable.rendertype, 'asset')
				)
			)
	}
}
