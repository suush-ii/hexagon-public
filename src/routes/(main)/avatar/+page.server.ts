import type { PageServerLoad } from './$types'
import { db } from '$src/lib/server/db'
import { inventoryTable, usersTable } from '$lib/server/schema/users'
import { eq, count, desc, and } from 'drizzle-orm'
import { getPageNumber } from '$lib/utils'
import { z } from 'zod'

import { assetTypes } from '$lib'

export const load: PageServerLoad = async ({ locals, url }) => {
	let page = getPageNumber(url)
	const result = await z.enum(assetTypes).safeParseAsync(url.searchParams.get('category'))

	let categoryParams = result.success ? result.data : 'hats'

	let size = 8

	const user = await db.query.usersTable.findFirst({
		columns: {
			headcolor: true,
			leftarmcolor: true,
			leftlegcolor: true,
			rightarmcolor: true,
			rightlegcolor: true,
			torsocolor: true
		},
		where: eq(usersTable.userid, locals.user.userid),
		with: {
			inventory: {
				columns: {
					itemid: true,
					wearing: true
				},
				with: {
					asset: { columns: { assetname: true } }
				},
				orderBy: desc(inventoryTable.obatineddate),
				limit: size,
				offset: (page - 1) * size,
				where: and(eq(inventoryTable.wearing, false), eq(inventoryTable.itemtype, categoryParams))
			}
		}
	})

	const userWearing = await db.query.usersTable.findFirst({
		columns: {},
		where: eq(usersTable.userid, locals.user.userid),
		with: {
			inventory: {
				columns: {
					itemid: true,
					wearing: true
				},
				with: {
					asset: { columns: { assetname: true } }
				},
				orderBy: desc(inventoryTable.obatineddate),
				limit: size,
				offset: (page - 1) * size,
				where: eq(inventoryTable.wearing, true)
			}
		}
	})

	const assetCount = await db
		.select({ count: count() })
		.from(inventoryTable)
		.where(
			and(
				eq(inventoryTable.userid, locals.user.userid),
				eq(inventoryTable.wearing, false),
				eq(inventoryTable.itemtype, categoryParams)
			)
		)
		.limit(1)

	const assetWearingCount = await db
		.select({ count: count() })
		.from(inventoryTable)
		.where(and(eq(inventoryTable.userid, locals.user.userid), eq(inventoryTable.wearing, true)))
		.limit(1)

	return {
		colors: {
			headColor: user?.headcolor,
			leftArmColor: user?.leftarmcolor,
			leftLegColor: user?.leftlegcolor,
			rightArmColor: user?.rightarmcolor,
			rightLegColor: user?.rightlegcolor,
			torsoColor: user?.torsocolor
		},
		inventory: user?.inventory,
		inventoryWearing: userWearing?.inventory,
		count: assetCount[0].count,
		countWearing: assetWearingCount[0].count
	}
}
