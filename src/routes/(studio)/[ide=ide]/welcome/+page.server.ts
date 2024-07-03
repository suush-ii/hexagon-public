import type { PageServerLoad } from './$types'
export const csr = false

export const load: PageServerLoad = async ({ url }) => {
	const filepath = url.searchParams.getAll('filepath')
	const filename = url.searchParams.getAll('filename')

	const files: { [key: string]: string } = {}
	for (let i = 0; i < filepath.length; i++) {
		files[filepath[i] || 'defaultPath'] = filename[i] || 'defaultName'
	}

	return {
		files
	}
}
