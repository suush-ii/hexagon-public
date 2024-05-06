import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema/assets'
import type { AssetTypes } from '$lib/types'
import { and, eq, not } from 'drizzle-orm'
import { categories } from './'

export const load: PageServerLoad = async ({ url }) => {
	let category =
		categories.find((o) => o.value === url.searchParams.get('category')) ??
		categories
			.map((category) => category.types)
			.flat()
			.find((product) => product?.value === url.searchParams.get('category')) ??
		categories[0]

	let items

	const commonWhere = and(
		not(eq(assetTable.assetType, 'games')),
		not(eq(assetTable.assetType, 'decals')),
		not(eq(assetTable.assetType, 'images')),
		not(eq(assetTable.assetType, 'audio')),
		eq(assetTable.moderationstate, 'approved')
	) // library assets

	if (category.value.includes('featured')) {
		category.value = category.value.replace('featured', '')
	}

	if (category.value === 'all' || category.value === '') {
		items = await db.query.assetTable.findMany({
			where: commonWhere, // library assets
			columns: {
				assetname: true,
				price: true,
				assetid: true,
				creatoruserid: true,
				updated: true,
				sales: true
			},
			with: {
				author: {
					columns: {
						username: true
					}
				}
			}
		})
	} else {
		items = await db.query.assetTable.findMany({
			where: and(commonWhere, eq(assetTable.assetType, category.value as AssetTypes)),
			columns: {
				assetname: true,
				price: true,
				assetid: true,
				creatoruserid: true,
				updated: true,
				sales: true
			},
			with: {
				author: {
					columns: {
						username: true
					}
				}
			}
		})
	}

	return { items }
}
