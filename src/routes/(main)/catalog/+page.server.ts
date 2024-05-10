import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema/assets'
import type { AssetTypes } from '$lib/types'
import { and, desc, eq, not } from 'drizzle-orm'
import { categories } from './'
import { commonWhere } from '$lib/server/catalog'

export const load: PageServerLoad = async ({ url }) => {
	let category =
		categories.find((o) => o.value === url.searchParams.get('category')) ??
		categories
			.map((category) => category.types)
			.flat()
			.find((product) => product?.value === url.searchParams.get('category')) ??
		categories[0]

	let items

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
			},
			orderBy: desc(assetTable.updated)
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
			},
			orderBy: desc(assetTable.updated)
		})
	}

	return { items }
}
