import { z } from 'zod'
import { formSchema as baseSchema } from '$lib/schemas/catalog/selllimiteduschema'

const { shape } = baseSchema

export const formSchema = z.object({
	price: shape.price
})

export type FormSchema = typeof formSchema
