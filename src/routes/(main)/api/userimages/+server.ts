import { db } from '$src/lib/server/db'
import { assetTable, userAdsTable } from '$src/lib/server/schema'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import { eq, sql, and, gt } from 'drizzle-orm'
import { z } from 'zod'
import { s3Url } from '$src/stores'

const adSchema = z.object({
	type: z.enum(['skyscraper', 'banner', 'rectangle'])
})

export const GET: RequestHandler = async ({ url }) => {
	const result = await adSchema.safeParseAsync({
		type: url.searchParams.get('type')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { type } = result.data

	const weighted_rows = db.$with('weighted_rows').as(
		db
			.select({
				cumulative_weight: sql`sum(${userAdsTable.bid}) over(order by ${userAdsTable.bid})`.as(
					'cumulative_weight'
				),
				total_weight: sql`sum(${userAdsTable.bid}) over()`.as('total_weight'),
				url: assetTable.simpleasseturl,
				useradid: userAdsTable.useradid
			})
			.from(userAdsTable)
			.leftJoin(assetTable, eq(userAdsTable.associatedimageid, assetTable.assetid))
			.where(and(eq(userAdsTable.adsize, type), gt(userAdsTable.bidexpires, sql`NOW()`)))
	)

	const [ad] = await db
		.with(weighted_rows)
		.select({
			//bid: weighted_rows.bid,
			//percentage: sql`ROUND((bid::decimal / total_weight * 100), 1)`.as('percentage'),
			url: weighted_rows.url,
			useradid: weighted_rows.useradid
		})
		.from(weighted_rows)
		.where(sql`cumulative_weight > (random() * total_weight)`)
		.orderBy(sql`cumulative_weight`)
		.limit(1)

	if (!ad) {
		if (type === 'skyscraper') {
			return json({ url: `/ads/AdSkyscraperTemplate.png`, useradid: 0 })
		} else if (type === 'rectangle') {
			console.log('hi')

			return json({ url: `/ads/AdRectangleTemplate.png`, useradid: 0 })
		} else {
			return json({ url: `/ads/AdBannerTemplate.png`, useradid: 0 })
		}
	}

	await db
		.update(userAdsTable)
		.set({
			impressionscurrent: sql`${userAdsTable.impressionscurrent} + 1`,
			impressionstotal: sql`${userAdsTable.impressionstotal} + 1`
		})
		.where(eq(userAdsTable.useradid, ad.useradid))

	return json({ url: `https://${s3Url}/images/${ad.url}`, useradid: ad.useradid })
}
