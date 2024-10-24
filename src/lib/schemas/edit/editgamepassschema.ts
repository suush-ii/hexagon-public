import { z } from 'zod'
import { formSchema as gamepassSchema } from '$lib/schemas/gamepassschema'

const { shape } = gamepassSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	onsale: z.boolean()
})

export type FormSchema = typeof formSchema
