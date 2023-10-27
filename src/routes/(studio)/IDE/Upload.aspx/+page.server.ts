import type { PageServerLoad } from './$types'

import page from './upload.html?raw';


export const load: PageServerLoad = async ({ locals }) => {
    return {
        page
    }
}
