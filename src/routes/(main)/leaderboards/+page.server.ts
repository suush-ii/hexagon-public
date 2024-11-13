import { db } from '$lib/server/db'
import { sql, desc, eq, count } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import { usersTable } from '$lib/server/schema'

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
			averageKnockoutsCone: sql<number>`AVG(${usersTable.knockouts}) FILTER (WHERE ${usersTable.registeredclan} = 'cone')`
		})
		.from(usersTable)
		.limit(1)

	const top50 = await db.query.usersTable.findMany({
		orderBy: desc(usersTable.coins),
		limit: 50,
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

	const labels = top50.map((user) => user.username)
	const usersData = top50.map((user) => user.coins)

	const top50StaffLess = await db.query.usersTable.findMany({
		orderBy: desc(usersTable.coins),
		limit: 50,
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

	const labelsStaffLess = top50StaffLess.map((user) => user.username)
	const usersDataStaffLess = top50StaffLess.map((user) => user.coins)

	const top50Knockouts = await db.query.usersTable.findMany({
		orderBy: desc(usersTable.knockouts),
		limit: 50,
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

	const labelsKnockouts = top50Knockouts.map((user) => user.username)
	const usersDataKnockouts = top50Knockouts.map((user) => user.knockouts)

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
		signupHistory
	}
}
