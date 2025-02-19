import type { PageServerLoad } from './$types'
import { db } from '$src/lib/server/db'
import { inventoryTable, usersTable, outfitsTable } from '$lib/server/schema'
import { eq, desc, and, sql, count, ilike } from 'drizzle-orm'
import { getPageNumber } from '$lib/utils'
import { z } from 'zod'
import { assetTypes } from '$lib'
import { assetTable } from '$src/lib/server/schema'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { formSchema } from '$lib/schemas/avatar/outfit'
import { zod } from 'sveltekit-superforms/adapters'
import type { Actions } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals, url }) => {
	let page = getPageNumber(url)
	let pageWearing = getPageNumber(url, 'pagewearing')
	let pageOutfits = getPageNumber(url, 'pageoutfits')
	const result = await z.enum(assetTypes).safeParseAsync(url.searchParams.get('category'))
	const search = url.searchParams.get('search') ?? ''

	const categoryParams = result.success ? result.data : 'hats'

	const size = 10

	const user = await db.query.usersTable.findFirst({
		columns: {
			headcolor: true,
			leftarmcolor: true,
			leftlegcolor: true,
			rightarmcolor: true,
			rightlegcolor: true,
			torsocolor: true
		},
		where: eq(usersTable.userid, locals.user.userid)
	})

	const assetCount = await db
		.select({ count: sql<number>`count(DISTINCT ${inventoryTable.itemid})::INTEGER`.as('count') })
		.from(inventoryTable)
		.innerJoin(assetTable, eq(inventoryTable.itemid, assetTable.assetid))
		.where(
			and(
				eq(inventoryTable.userid, locals.user.userid),
				eq(inventoryTable.wearing, false),
				eq(inventoryTable.itemtype, categoryParams),
				ilike(assetTable.assetname, `%${search}%`)
			)
		)
		.limit(1)

	const assetWearingCount = await db
		.select({ count: sql<number>`count(DISTINCT ${inventoryTable.itemid})::INTEGER`.as('count') })
		.from(inventoryTable)
		.innerJoin(assetTable, eq(inventoryTable.itemid, assetTable.assetid))
		.where(and(eq(inventoryTable.userid, locals.user.userid), eq(inventoryTable.wearing, true)))
		.limit(1)

	if (assetCount[0].count < (page - 1) * size) {
		page = 1
	}

	if (assetWearingCount[0].count < (page - 1) * size) {
		pageWearing = 1
	}

	const inventory = await db
		.selectDistinctOn([inventoryTable.itemid], {
			itemid: inventoryTable.itemid,
			wearing: inventoryTable.wearing,
			asset: { assetname: assetTable.assetname, limited: assetTable.limited }
		})
		.from(inventoryTable)
		.where(
			and(
				eq(inventoryTable.wearing, false),
				eq(inventoryTable.itemtype, categoryParams),
				eq(inventoryTable.userid, locals.user.userid),
				ilike(assetTable.assetname, `%${search}%`)
			)
		)
		.orderBy(desc(inventoryTable.itemid), desc(inventoryTable.obatineddate))
		.limit(size)
		.offset((page - 1) * size)
		.innerJoin(assetTable, eq(inventoryTable.itemid, assetTable.assetid))

	const inventoryWearing = await db
		.selectDistinctOn([inventoryTable.itemid], {
			itemid: inventoryTable.itemid,
			wearing: inventoryTable.wearing,
			asset: { assetname: assetTable.assetname, limited: assetTable.limited }
		})
		.from(inventoryTable)
		.where(and(eq(inventoryTable.wearing, true), eq(inventoryTable.userid, locals.user.userid)))
		.orderBy(desc(inventoryTable.itemid), desc(inventoryTable.obatineddate))
		.limit(size)
		.offset((pageWearing - 1) * size)
		.innerJoin(assetTable, eq(inventoryTable.itemid, assetTable.assetid))

	let outfits

	let outfitCount

	if (url.searchParams.get('tab') === 'outfits') {
		;[outfitCount] = await db
			.select({ count: count() })
			.from(outfitsTable)
			.where(
				and(
					eq(outfitsTable.ownerid, locals.user.userid),
					ilike(outfitsTable.outfitname, `%${search}%`)
				)
			)

		if (outfitCount.count < (page - 1) * size) {
			pageOutfits = 1
		}

		outfits = await db.query.outfitsTable.findMany({
			where: and(
				eq(outfitsTable.ownerid, locals.user.userid),
				ilike(outfitsTable.outfitname, `%${search}%`)
			),
			columns: {
				assets: true,
				avatarbody: true,
				outfitid: true,
				outfitname: true,
				created: true
			},
			orderBy: desc(outfitsTable.created),
			limit: size,
			offset: (pageOutfits - 1) * size
		})
	}

	return {
		colors: {
			headColor: user?.headcolor,
			leftArmColor: user?.leftarmcolor,
			leftLegColor: user?.leftlegcolor,
			rightArmColor: user?.rightarmcolor,
			rightLegColor: user?.rightlegcolor,
			torsoColor: user?.torsocolor
		},
		inventory,
		inventoryWearing,
		count: assetCount[0].count,
		countWearing: assetWearingCount[0].count,
		form: await superValidate(zod(formSchema)),
		outfits,
		outfitCount: outfitCount?.count
	}
}

export const actions: Actions = {
	outfits: async (event) => {
		const form = await superValidate(event, zod(formSchema))
		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { locals, params } = event

		const [outfitCount] = await db
			.select({
				count: count()
			})
			.from(outfitsTable)
			.where(eq(outfitsTable.ownerid, locals.user.userid))

		if (outfitCount.count >= 20) {
			return setError(form, 'outfitname', 'You can only have 20 outfits!')
		}

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.userid, locals.user.userid),
			columns: {
				avatarbody: true,
				headcolor: true,
				leftarmcolor: true,
				leftlegcolor: true,
				rightarmcolor: true,
				rightlegcolor: true,
				torsocolor: true
			}
		})

		const inventoryWearing = await db
			.selectDistinctOn([inventoryTable.itemid], {
				itemid: inventoryTable.itemid
			})
			.from(inventoryTable)
			.where(and(eq(inventoryTable.wearing, true), eq(inventoryTable.userid, locals.user.userid)))

		await db.insert(outfitsTable).values({
			ownerid: locals.user.userid,
			assets: inventoryWearing.map((item) => item.itemid),
			outfitname: form.data.outfitname,
			...user
		})
	}
}
