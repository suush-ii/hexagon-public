import promClient from 'prom-client'
import { db } from '../db'
import { jobsTable } from '../schema'
import { sum } from 'drizzle-orm'

const register = new promClient.Registry()

register.setDefaultLabels({
	app: 'Hexagon'
})

promClient.collectDefaultMetrics({ register })

export function getMetrics() {
	return register.metrics()
}

export function getContentType() {
	return register.contentType
}

export const httpRequestTimer = new promClient.Histogram({
	name: 'http_request_duration_ms',
	help: 'Duration of HTTP requests in ms',
	labelNames: ['method', 'route', 'code'],
	// buckets for response time from 0.1ms to 1s
	buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000],
	registers: [register]
})

export const playercounter = new promClient.Gauge({
	name: 'node_players',
	help: 'Amount of players every minute',
	async collect() {
		const [games] = await db
			.select({
				active: sum(jobsTable.active)
			})
			.from(jobsTable)
			.limit(1)

		this.set(Number(games.active ?? 0))
	},
	registers: [register]
})
