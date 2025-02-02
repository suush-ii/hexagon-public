import { type RequestHandler } from '@sveltejs/kit'
import { getMetrics, getContentType } from '$lib/server/metrics/registry'

export const GET: RequestHandler = async ({}) => {
	return new Response(await getMetrics(), { headers: { 'Content-Type': getContentType() } })
}
