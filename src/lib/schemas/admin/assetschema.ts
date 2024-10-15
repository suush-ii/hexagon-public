import { z } from 'zod'
import { assetGenreZod } from '$lib'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'

const { shape } = assetSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	asset: shape.asset,
	genres: shape.genres,
	stock: z.coerce.number().int().min(0).max(10000).default(0)
})

export type FormSchema = typeof formSchema
