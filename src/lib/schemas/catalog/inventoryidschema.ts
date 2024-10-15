import { z } from 'zod'

export const formSchema = z.object({
	inventoryId: z.coerce
		.number()
		.int({ message: 'Whole number please!' })
		.min(1, { message: 'ID must be at least 1!' })
		.default(1)
})

export type FormSchema = typeof formSchema
