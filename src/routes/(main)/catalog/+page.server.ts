import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { assetTable } from '$lib/server/schema/assets'
import { or, eq } from 'drizzle-orm'
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

	if (category.value === 'all') {
		items = await db.query.assetTable.findMany({
			where: or(eq(assetTable.assetType, 'shirts'), eq(assetTable.assetType, 'pants')),
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
