import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'

const { shape } = assetSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: z.coerce
		.number()
		.int()
		.positive({ message: 'Price must be a positive number!' })
		.min(1, { message: 'Price must be at least 1!' })
		.max(999999999, { message: 'The maximum price for this is 999999999!' })
		.default(1),
	asset: shape.asset
})

export type FormSchema = typeof formSchema
