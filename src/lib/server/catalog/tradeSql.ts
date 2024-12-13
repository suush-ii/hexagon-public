import { aliasedTable, desc, eq, sql } from 'drizzle-orm'
import { assetTable, inventoryTable, tradesTable, usersTable } from '../schema'
import { db } from '../db'

export function tradeSql(size: number, page: number) {
	const requesting = aliasedTable(inventoryTable, 'requesting')
	const requestingAsset = aliasedTable(assetTable, 'requestingAsset')
	const recepientUser = aliasedTable(usersTable, 'recepientUser')

	return db
		.select({
			time: tradesTable.time,
			status: tradesTable.status,
			denyreason: tradesTable.denyreason,
			offering: sql`coalesce(json_agg(DISTINCT jsonb_build_object('itemid', ${inventoryTable.itemid}, 'inventoryid', ${inventoryTable.inventoryid}, 'assetname', ${assetTable.assetname}, 'serial', ${inventoryTable.serialid}, 'sales', ${assetTable.sales}, 'recentaverageprice', ${assetTable.recentaverageprice}, 'limited', ${assetTable.limited}, 'originalprice', ${assetTable.price})) FILTER (WHERE ${inventoryTable.itemid} IS NOT NULL), '[]'::json)`,
			requesting: sql`coalesce(json_agg(DISTINCT jsonb_build_object('itemid', ${requesting.itemid}, 'inventoryid', ${requesting.inventoryid}, 'assetname', ${requestingAsset.assetname}, 'serial', ${requesting.serialid}, 'sales', ${requestingAsset.sales}, 'recentaverageprice', ${requestingAsset.recentaverageprice}, 'limited', ${requestingAsset.limited}, 'originalprice', ${requestingAsset.price})) FILTER (WHERE ${requesting.itemid} IS NOT NULL), '[]'::json)`,
			offeringmoons: tradesTable.offeringmoons,
			requestingmoons: tradesTable.requestingmoons,
			sender: { username: usersTable.username, userid: tradesTable.senderid },
			recepient: { username: recepientUser.username, userid: tradesTable.recipient },
			requestid: tradesTable.requestid
		})
		.from(tradesTable)
		.orderBy(desc(tradesTable.time))
		.limit(size)
		.offset((page - 1) * size)
		.innerJoin(usersTable, eq(tradesTable.senderid, usersTable.userid))
		.innerJoin(recepientUser, eq(tradesTable.recipient, recepientUser.userid))
		.leftJoin(inventoryTable, sql`${inventoryTable.inventoryid} = ANY(${tradesTable.offering})`)
		.leftJoin(requesting, sql`${requesting.inventoryid} = ANY(${tradesTable.requesting})`)
		.leftJoin(assetTable, sql`${assetTable.assetid} = ${inventoryTable.itemid}`)
		.leftJoin(requestingAsset, sql`${requestingAsset.assetid} = ${requesting.itemid}`)
		.groupBy(
			tradesTable.time,
			tradesTable.senderid,
			tradesTable.status,
			tradesTable.offeringmoons,
			tradesTable.requestingmoons,
			usersTable.username,
			recepientUser.username,
			tradesTable.requestid
		)
}
