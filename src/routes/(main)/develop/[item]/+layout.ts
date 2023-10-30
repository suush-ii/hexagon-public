import { z } from 'zod'
import type { LayoutLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: LayoutLoad    = async ({params}) => {
    let result = await z.enum(['games', 'audio', 'decals']).safeParseAsync(params.item)

    if (result.success === false){
        throw error(404, {success: false, message: 'Not found.'})
    }

	return {
		item: params.item
	}
}   
