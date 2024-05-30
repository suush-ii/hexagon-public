import { z } from 'zod'
import { formSchema as clothingSchema } from '$lib/schemas/clothingschema'

const { shape } = clothingSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	genres: shape.genres,
	onsale: z.boolean()
})

export type FormSchema = typeof formSchema
