import { z } from 'zod'

export const formSchema = z.object({
	price: z.coerce
		.number()
		.int({ message: 'Whole number please!' })
		.min(1, { message: 'Price must be at least 1!' })
		.max(999999999, { message: 'The maximum price for this is 999999999!' })
		.default(1),
	serial: z.coerce.number().int()
})

export type FormSchema = typeof formSchema
