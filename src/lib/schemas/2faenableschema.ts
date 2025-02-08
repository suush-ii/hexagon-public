import { z } from 'zod'

export const formSchema = z.object({
	code: z.coerce.number().int(),
	secret: z.string()
})

export type FormSchema = typeof formSchema
