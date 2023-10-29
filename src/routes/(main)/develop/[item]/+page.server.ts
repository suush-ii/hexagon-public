import { z } from 'zod'
import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({params}) => {
    let result = await z.enum(['games', 'audio', 'decals']).safeParseAsync(params.item)

    if (result.success === false){
        throw error(400, {success: false, message: 'Malformed input.'})
    }

	return {
		item: params.item
	}
}
