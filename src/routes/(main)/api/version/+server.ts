import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
	const executableType = url.searchParams.get('type') ?? 'player'

	const executableVersion = url.searchParams.get('version') ?? '2016'

	console.log(url.searchParams)

	return json({
		success: true,
		message: '',
		data: {
			hash: 'f6240985567e6d224d84bd451f4ed9f440531b79953f4611e82707248f4678c1'
		}
	})
}
