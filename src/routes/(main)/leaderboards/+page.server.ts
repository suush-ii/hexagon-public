import { db } from '$lib/server/db'
import { sql, desc, eq, count, sum } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import { assetTable, inventoryTable, usersTable } from '$lib/server/schema'

export const load: PageServerLoad = async ({ locals, url }) => {
	const [clanStats] = await db
		.select({
			membersWuff: sql<number>`COUNT(*) FILTER (WHERE ${usersTable.registeredclan} = 'wuff')`,
			membersJamrio: sql<number>`COUNT(*) FILTER (WHERE ${usersTable.registeredclan} = 'jamrio')`,
			membersCone: sql<number>`COUNT(*) FILTER (WHERE ${usersTable.registeredclan} = 'cone')`,
			knockoutsWuff: sql<number>`SUM(${usersTable.knockouts}) FILTER (WHERE ${usersTable.registeredclan} = 'wuff')`,
			knockoutsJamrio: sql<number>`SUM(${usersTable.knockouts}) FILTER (WHERE ${usersTable.registeredclan} = 'jamrio')`,
			knockoutsCone: sql<number>`SUM(${usersTable.knockouts}) FILTER (WHERE ${usersTable.registeredclan} = 'cone')`,
			averageKnockoutsWuff: sql<number>`AVG(${usersTable.knockouts}) FILTER (WHERE ${usersTable.registeredclan} = 'wuff')`,
			averageKnockoutsJamrio: sql<number>`AVG(${usersTable.knockouts}) FILTER (WHERE ${usersTable.registeredclan} = 'jamrio')`,
			averageKnockoutsCone: sql<number>`AVG(${usersTable.knockouts}) FILTER (WHERE ${usersTable.registeredclan} = 'cone')`,
			moonsWuff: sql<number>`SUM(${usersTable.coins}) FILTER (WHERE ${usersTable.registeredclan} = 'wuff')`,
			moonsJamrio: sql<number>`SUM(${usersTable.coins}) FILTER (WHERE ${usersTable.registeredclan} = 'jamrio')`,
			moonsCone: sql<number>`SUM(${usersTable.coins}) FILTER (WHERE ${usersTable.registeredclan} = 'cone')`,
			averageMoonsWuff: sql<number>`AVG(${usersTable.coins}) FILTER (WHERE ${usersTable.registeredclan} = 'wuff')`,
			averageMoonsJamrio: sql<number>`AVG(${usersTable.coins}) FILTER (WHERE ${usersTable.registeredclan} = 'jamrio')`,
			averageMoonsCone: sql<number>`AVG(${usersTable.coins}) FILTER (WHERE ${usersTable.registeredclan} = 'cone')`
		})
		.from(usersTable)
		.limit(1)

	const top25 = await db.query.usersTable.findMany({
		orderBy: desc(usersTable.coins),
		limit: 25,
		columns: {
			coins: true,
			username: true
		}
	})

	const top1 = await db.query.usersTable.findFirst({
		orderBy: desc(usersTable.coins),
		columns: {
			userid: true,
			username: true
		}
	})

	const labels = top25.map((user) => user.username)
	const usersData = top25.map((user) => user.coins)

	const top25StaffLess = await db.query.usersTable.findMany({
		orderBy: desc(usersTable.coins),
		limit: 25,
		columns: {
			coins: true,
			username: true
		},
		where: eq(usersTable.role, 'normal')
	})

	const top1StaffLess = await db.query.usersTable.findFirst({
		orderBy: desc(usersTable.coins),
		columns: {
			userid: true,
			username: true
		},
		where: eq(usersTable.role, 'normal')
	})

	const labelsStaffLess = top25StaffLess.map((user) => user.username)
	const usersDataStaffLess = top25StaffLess.map((user) => user.coins)

	const top25Knockouts = await db.query.usersTable.findMany({
		orderBy: desc(usersTable.knockouts),
		limit: 25,
		columns: {
			username: true,
			knockouts: true
		}
	})

	const top1Knockouts = await db.query.usersTable.findFirst({
		orderBy: desc(usersTable.knockouts),
		columns: {
			userid: true,
			username: true
		}
	})

	const labelsKnockouts = top25Knockouts.map((user) => user.username)
	const usersDataKnockouts = top25Knockouts.map((user) => user.knockouts)

	const top25Rap = await db
		.select({
			userid: usersTable.userid,
			username: usersTable.username,
			rap: sum(assetTable.recentaverageprice)
		})
		.from(usersTable)
		.innerJoin(inventoryTable, eq(inventoryTable.userid, usersTable.userid))
		.innerJoin(assetTable, eq(assetTable.assetid, inventoryTable.itemid))
		.orderBy(desc(sum(assetTable.recentaverageprice)))
		.groupBy(usersTable.userid, usersTable.username)
		.limit(25)

	const [top1Rap] = await db
		.select({
			userid: usersTable.userid,
			username: usersTable.username,
			rap: sum(assetTable.recentaverageprice)
		})
		.from(usersTable)
		.innerJoin(inventoryTable, eq(inventoryTable.userid, usersTable.userid))
		.innerJoin(assetTable, eq(assetTable.assetid, inventoryTable.itemid))
		.orderBy(desc(sum(assetTable.recentaverageprice)))
		.groupBy(usersTable.userid, usersTable.username)
		.limit(1)

	const labelsRap = top25Rap.map((user) => user.username)
	const usersDataRap = top25Rap.map((user) => user.rap)

	console.log(top25Rap)

	const signupHistory = await db
		.select({
			x: sql`DATE_TRUNC('day', ${usersTable.joindate})`,
			y: count()
		})
		.from(usersTable)
		.where(sql`${usersTable.joindate} >= NOW() - INTERVAL '30 days'`)
		.groupBy(sql`DATE_TRUNC('day', ${usersTable.joindate})`)
		.orderBy(sql`DATE_TRUNC('day', ${usersTable.joindate})`)
		.limit(30)

	return {
		clanStats,
		labels,
		usersData,
		labelsStaffLess,
		usersDataStaffLess,
		labelsKnockouts,
		usersDataKnockouts,
		top1,
		top1StaffLess,
		top1Knockouts,
		signupHistory,
		labelsRap,
		usersDataRap,
		top1Rap
	}
}
