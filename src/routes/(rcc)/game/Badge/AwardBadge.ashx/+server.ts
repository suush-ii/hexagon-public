import { db } from '$lib/server/db'
import {
	inventoryTable,
	assetTable,
	placesTable,
	usersTable,
	eventItemsTable
} from '$lib/server/schema'
import { type RequestHandler, error, json, text } from '@sveltejs/kit'
import { eq, and, count } from 'drizzle-orm'
import { z } from 'zod'

const awardBadgeSchema = z.object({
	badgeid: z.coerce.number().int(),
	userid: z.coerce.number().int(),
	placeid: z.coerce.number().int()
})

export const POST: RequestHandler = async ({ url }) => {
	const result = await awardBadgeSchema.safeParseAsync({
		badgeid: url.searchParams.get('BadgeID'),
		userid: url.searchParams.get('UserID'),
		placeid: url.searchParams.get('PlaceID')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { badgeid, userid, placeid } = result.data

	const place = await db.query.placesTable.findFirst({
		where: eq(placesTable.placeid, placeid),
		columns: {
			universeid: true
		}
	})

	if (!place) {
		return error(404, { success: false, message: 'Place not found.' })
	}

	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, badgeid),
		columns: {
			associatedgameid: true,
			assetname: true
		},
		with: {
			author: {
				columns: {
					username: true
				}
			}
		}
	})

	if (!asset) {
		return error(404, { success: false, message: 'Badge not found.' })
	}

	if (asset.associatedgameid != place.universeid) {
		return error(400, { success: false, message: 'Badge does not belong to this place.' })
	}

	const inventory = await db.query.inventoryTable.findFirst({
		where: and(eq(inventoryTable.itemid, badgeid), eq(inventoryTable.userid, userid))
	})

	if (inventory) {
		return text('0') // already owned
	}

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, userid),
		columns: {
			username: true
		}
	})

	if (!user) {
		return error(404, { success: false, message: 'User not found.' })
	}

	const eventItem = await db.query.eventItemsTable.findFirst({
		where: eq(eventItemsTable.badgeid, badgeid),
		columns: { awardid: true }
	})

	await db.transaction(async (tx) => {
		await tx.insert(inventoryTable).values({
			itemid: badgeid,
			userid: userid,
			wearing: false,
			itemtype: 'badges'
		})

		const [badgeCount] = await tx
			.select({ count: count() })
			.from(inventoryTable)
			.where(and(eq(inventoryTable.itemid, badgeid), eq(inventoryTable.userid, userid)))
			.limit(1)

		if (badgeCount.count > 1) {
			tx.rollback()
		}

		if (eventItem) {
			const eventItemAward = await db.query.assetTable.findFirst({
				where: eq(assetTable.assetid, eventItem.awardid),
				columns: { assetType: true, sales: true }
			})

			if (eventItemAward) {
				const alreadyOwned = await db
					.select()
					.from(inventoryTable)
					.where(
						and(eq(inventoryTable.userid, userid), eq(inventoryTable.itemid, eventItem.awardid))
					)
					.limit(1)

				if (alreadyOwned.length === 0) {
					await tx.insert(inventoryTable).values({
						itemid: eventItem.awardid,
						userid: userid,
						wearing: false,
						itemtype: eventItemAward.assetType
					})

					await tx
						.update(assetTable)
						.set({ sales: eventItemAward.sales + 1 })
						.where(eq(assetTable.assetid, eventItem.awardid))
				}
			}
		}
	})

	return text(`${user.username} won ${asset.author.username}'s "${asset.assetname}" award!`) // this fucking sucks roblox
}
