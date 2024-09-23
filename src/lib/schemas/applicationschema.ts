import { z } from 'zod'

export const formSchema = z.object({
	applicationid: z.string().uuid()
})

export type FormSchema = typeof formSchema
