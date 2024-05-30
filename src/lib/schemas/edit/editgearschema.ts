import { z } from 'zod'
import { formSchema as gearSchema } from '$lib/schemas/gearschema'

const { shape } = gearSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	genres: shape.genres,
	onsale: z.boolean(),
	gearattributes: shape.gearattributes
})

export type FormSchema = typeof formSchema
