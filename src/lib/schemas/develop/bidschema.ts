import { z } from 'zod'

export const formSchema = z.object({
	bid: z.coerce
		.number()
		.int({ message: 'Whole number please!' })
		.min(1, { message: 'Bid must be at least 1!' })
		.max(999999999, { message: 'The maximum bid for this is 999999999!' })
		.default(0),
	adId: z.coerce.number().int()
})

export type FormSchema = typeof formSchema
