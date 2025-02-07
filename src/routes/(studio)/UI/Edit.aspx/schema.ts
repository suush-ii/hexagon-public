import { z } from 'zod'

export const ideAssetSchema = z.object({
	assetid: z.coerce.number().int()
})
