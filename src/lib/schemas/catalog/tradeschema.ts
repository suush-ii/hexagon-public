import { z } from 'zod'

export const formSchema = z.object({
	action: z.enum(['accept', 'counter', 'decline']),
	requestid: z.number().int()
})

export type FormSchema = typeof formSchema
