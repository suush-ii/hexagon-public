import { z } from 'zod'

export const formSchema = z.object({
	name: z
		.string({ required_error: 'Name required.' })
		.min(1, { message: 'Name required.' })
		.max(50, { message: "Name can't be over 20 characters!" }),
	description: z.string().max(1000, { message: "Description can't be over 1000 characters!" }),
	price: z.coerce
		.number()
		.int()
		.positive({ message: 'Price must be a positive number!' })
		.min(5, { message: 'Price must be at least 5!' })
		.max(999999999, { message: 'The maximum price for this is 999999999!' }),
	clothing: z.any(),
	type: z.enum(['Shirts', 'Pants'])
})

export type FormSchema = typeof formSchema
