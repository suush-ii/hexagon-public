import { z } from 'zod'

export const formSchema = z.object({
	outfitname: z
		.string()
		.min(1)
		.max(20, { message: 'Outfit name must be between 1 and 20 characters' })
})

export type FormSchema = typeof formSchema
