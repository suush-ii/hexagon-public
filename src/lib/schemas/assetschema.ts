import { z } from 'zod'

export const formSchema = z.object({
	name: z
		.string({ required_error: 'Name required.' })
		.min(1, { message: 'Name required.' })
		.max(20, { message: "Name can't be over 20 characters!" }),
	description: z.string().max(1000, { message: "Description can't be over 1000 characters!" }),
	price: z.coerce
		.number()
		.int({ message: 'Whole number please!' })
		.min(0, { message: 'Price must be at least 0!' })
		.max(999999999, { message: 'The maximum price for this is 999999999!' })
		.default(0),
	asset: z.any(),
	serversize: z.any(), // kind of a hack so typescript doesn't complain we don't actually use this value for anything
	genre: z.any()
})

export type FormSchema = typeof formSchema
