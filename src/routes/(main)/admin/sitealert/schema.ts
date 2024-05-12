import { z } from 'zod'

export const formSchema = z.object({
	sitealert: z.string().max(100)
})

export type FormSchema = typeof formSchema
