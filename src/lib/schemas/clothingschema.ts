import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'

const { shape } = assetSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	clothing: z.any(),
	type: z.enum(['Shirts', 'Pants']),
	game: shape.game,
	serversize: shape.serversize,
	asset: z.never()
})

export type FormSchema = typeof formSchema
