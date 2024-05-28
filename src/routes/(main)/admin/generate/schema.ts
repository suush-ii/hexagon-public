import { z } from 'zod'

export const formSchema = z.object({
	amount: z.number().int().positive().max(20).default(1)
})

export type FormSchema = typeof formSchema
