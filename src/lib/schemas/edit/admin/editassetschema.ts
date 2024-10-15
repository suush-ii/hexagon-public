import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/edit/editassetschema'

const { shape } = assetSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	genres: shape.genres,
	onsale: shape.onsale,
	limited: z.boolean()
})

export type FormSchema = typeof formSchema
