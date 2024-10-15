import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { tradeSql } from '$lib/server/catalog/tradeSql'
import { getPageNumber } from '$lib/utils'
import { tradesTable, usersTable } from '$lib/server/schema'
import { db } from '$lib/server/db'
import { and, count, eq, or } from 'drizzle-orm'
import { z } from 'zod'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema as tradeSchema } from '$lib/schemas/catalog/tradeschema'

export const load: PageServerLoad = async ({ url }) => {
	if (!url.searchParams.get('id')) {
		redirect(302, '/admin/users/find?redirect=tradehistory')
	}

	const result = await z.number().safeParseAsync(Number(url.searchParams.get('id')))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const userid = result.data

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, result.data),
		columns: {
			username: true
		}
	})

	if (!user) {
		error(404, { success: false, message: 'User not found!' })
	}

	let page = getPageNumber(url)
	const tradeForm = await superValidate(zod(tradeSchema))

	const size = 30
	let type = url.searchParams.get('type') ?? 'inbound'

	if (type !== 'inbound' && type !== 'outbound' && type !== 'completed' && type !== 'inactive') {
		type = 'inbound'
	}

	if (type === 'inbound') {
		const [tradesCount] = await db
			.select({ count: count() })
			.from(tradesTable)
			.where(and(eq(tradesTable.recipient, userid), eq(tradesTable.status, 'pending')))

		if (tradesCount.count < (page - 1) * size) {
			page = 1
		}

		const trades = await tradeSql(size, page).where(
			and(eq(tradesTable.recipient, userid), eq(tradesTable.status, 'pending'))
		)

		return {
			trades,
			tradesCount: tradesCount.count,
			tradeForm,
			userid,
			username: user.username
		}
	}

	if (type === 'outbound') {
		const [tradesCount] = await db
			.select({ count: count() })
			.from(tradesTable)
			.where(and(eq(tradesTable.senderid, userid), eq(tradesTable.status, 'pending')))

		if (tradesCount.count < (page - 1) * size) {
			page = 1
		}

		const trades = await tradeSql(size, page).where(
			and(eq(tradesTable.senderid, userid), eq(tradesTable.status, 'pending'))
		)

		return {
			trades,
			tradesCount: tradesCount.count,
			tradeForm,
			userid,
			username: user.username
		}
	}

	if (type === 'completed') {
		const [tradesCount] = await db
			.select({ count: count() })
			.from(tradesTable)
			.where(
				and(
					or(eq(tradesTable.recipient, userid), eq(tradesTable.senderid, userid)),
					eq(tradesTable.status, 'accepted')
				)
			)

		if (tradesCount.count < (page - 1) * size) {
			page = 1
		}

		const trades = await tradeSql(size, page).where(
			and(
				or(eq(tradesTable.recipient, userid), eq(tradesTable.senderid, userid)),
				eq(tradesTable.status, 'accepted')
			)
		)

		return {
			trades,
			tradesCount: tradesCount.count,
			tradeForm,
			userid,
			username: user.username
		}
	}

	if (type === 'inactive') {
		const [tradesCount] = await db
			.select({ count: count() })
			.from(tradesTable)
			.where(
				and(
					or(eq(tradesTable.recipient, userid), eq(tradesTable.senderid, userid)),
					eq(tradesTable.status, 'denied')
				)
			)

		if (tradesCount.count < (page - 1) * size) {
			page = 1
		}

		const trades = await tradeSql(size, page).where(
			and(
				or(eq(tradesTable.recipient, userid), eq(tradesTable.senderid, userid)),
				eq(tradesTable.status, 'denied')
			)
		)

		return {
			trades,
			tradesCount: tradesCount.count,
			tradeForm,
			userid,
			username: user.username
		}
	}

	return {
		trades: [],
		tradesCount: 0,
		tradeForm,
		userid,
		username: user.username
	}
}
