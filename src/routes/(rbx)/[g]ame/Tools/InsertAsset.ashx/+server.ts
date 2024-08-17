import { type RequestHandler, text, error } from '@sveltejs/kit'
import { z } from 'zod'

const assetSchema = z.number().int().positive()

let luas = import.meta.glob('../sets/*.xml', {
	eager: true,
	query: '?raw',
	import: 'default'
})

luas = Object.fromEntries(
	Object.entries(luas).map(([key, value]) => {
		const path = key
			?.split('/')
			?.at(-1)
			?.split('.')[0]
			.replace(/[^0-9]/g, '')
		return [path, value]
	})
)

export const GET: RequestHandler = async ({ url }) => {
	const result = await assetSchema.safeParseAsync(
		Number(url.searchParams.get('sid') ?? url.searchParams.get('userid'))
	)

	if (!result.success) {
		return text('<List></List>')
	}

	const id = result.data

	if (luas[id]) {
		return text(luas[id])
	}

	return text('<List></List>')
}
