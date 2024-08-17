import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema/assets'
import type { AssetTypes, GearAttributes } from '$lib/types'
import { and, count, desc, eq, ilike, arrayOverlaps, not, or } from 'drizzle-orm'
import { categories } from './'
import { commonWhere } from '$lib/server/catalog'
import { getPageNumber } from '$lib/utils'

export const load: PageServerLoad = async ({ url }) => {
	const category =
		categories.find((o) => o.value === url.searchParams.get('category')) ??
		categories
			.map((category) => category.types)
			.flat()
			.find((product) => product?.value === url.searchParams.get('category')) ??
		categories[0]

	let gearAttribute = false
	const gearsCategory = categories[5]

	const categoryExists = gearsCategory?.types?.find((type) => type.value === category.value)
	if (categoryExists && category.value !== 'gears') {
		gearAttribute = true
	}

	const search = url.searchParams.get('search') ?? ''

	let items
	let itemscount

	if (category.value.includes('featured')) {
		category.value = category.value.replace('featured', '')
	}

	let page = getPageNumber(url)

	const size = 28

	if (category.value === 'all' || category.value === '') {
		itemscount = await db
			.select({ count: count() })
			.from(assetTable)
			.where(and(commonWhere, ilike(assetTable.assetname, `%${search}%`)))

		if (itemscount[0].count < (page - 1) * size) {
			page = 1
		}

		items = await db.query.assetTable.findMany({
			where: and(commonWhere, ilike(assetTable.assetname, `%${search}%`)), // library assets
			columns: {
				assetname: true,
				price: true,
				assetid: true,
				creatoruserid: true,
				updated: true,
				sales: true,
				favorites: true
			},
			with: {
				author: {
					columns: {
						username: true
					}
				}
			},
			orderBy: desc(assetTable.updated),
			limit: size,
			offset: (page - 1) * size
		})
	} else if (category.value === 'clothing') {
		itemscount = await db
			.select({ count: count() })
			.from(assetTable)
			.where(
				and(
					commonWhere,
					or(eq(assetTable.assetType, 'shirts'), eq(assetTable.assetType, 'pants')),
					ilike(assetTable.assetname, `%${search}%`)
				)
			)

		if (itemscount[0].count < (page - 1) * size) {
			page = 1
		}

		items = await db.query.assetTable.findMany({
			where: and(
				commonWhere,
				or(eq(assetTable.assetType, 'shirts'), eq(assetTable.assetType, 'pants')),
				ilike(assetTable.assetname, `%${search}%`)
			), // library assets
			columns: {
				assetname: true,
				price: true,
				assetid: true,
				creatoruserid: true,
				updated: true,
				sales: true,
				favorites: true
			},
			with: {
				author: {
					columns: {
						username: true
					}
				}
			},
			orderBy: desc(assetTable.updated),
			limit: size,
			offset: (page - 1) * size
		})
	} else if (gearAttribute === true) {
		itemscount = await db
			.select({ count: count() })
			.from(assetTable)
			.where(
				and(
					commonWhere,
					eq(assetTable.assetType, 'gears'),
					ilike(assetTable.assetname, `%${search}%`),
					arrayOverlaps(assetTable.gearattributes, [category.value as GearAttributes])
				)
			)

		if (itemscount[0].count < (page - 1) * size) {
			page = 1
		}

		items = await db.query.assetTable.findMany({
			where: and(
				commonWhere,
				eq(assetTable.assetType, 'gears'),
				ilike(assetTable.assetname, `%${search}%`),
				arrayOverlaps(assetTable.gearattributes, [category.value as GearAttributes])
			),
			columns: {
				assetname: true,
				price: true,
				assetid: true,
				creatoruserid: true,
				updated: true,
				sales: true,
				favorites: true
			},
			with: {
				author: {
					columns: {
						username: true
					}
				}
			},
			orderBy: desc(assetTable.updated),
			limit: size,
			offset: (page - 1) * size
		})
	} else {
		itemscount = await db
			.select({ count: count() })
			.from(assetTable)
			.where(
				and(
					commonWhere,
					eq(assetTable.assetType, category.value as AssetTypes),
					ilike(assetTable.assetname, `%${search}%`)
				)
			)

		if (itemscount[0].count < (page - 1) * size) {
			page = 1
		}

		items = await db.query.assetTable.findMany({
			where: and(
				commonWhere,
				eq(assetTable.assetType, category.value as AssetTypes),
				ilike(assetTable.assetname, `%${search}%`)
			),
			columns: {
				assetname: true,
				price: true,
				assetid: true,
				creatoruserid: true,
				updated: true,
				sales: true,
				favorites: true
			},
			with: {
				author: {
					columns: {
						username: true
					}
				}
			},
			orderBy: desc(assetTable.updated),
			limit: size,
			offset: (page - 1) * size
		})
	}

	return { items, itemscount: itemscount[0].count }
}
