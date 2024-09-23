import { z } from 'zod'

export const formSchema = z.object({
	approved: z.boolean().default(true),
	applicationid: z.string().uuid(),
	internalreason: z.string().optional()
})

export type FormSchema = typeof formSchema
