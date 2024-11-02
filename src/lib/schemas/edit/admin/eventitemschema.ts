import { z } from 'zod'

export const formSchema = z.object({
	assetid: z.coerce.number().optional()
})

export type FormSchema = typeof formSchema
