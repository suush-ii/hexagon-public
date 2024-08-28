import { z } from 'zod'

export const formSchema = z.object({
	scrubassetname: z.boolean().default(false)
})

export type FormSchema = typeof formSchema
