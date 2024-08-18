import { z } from 'zod'
import { formSchema as placeSchema } from '$lib/schemas/placeschema'

const { shape } = placeSchema

export const formSchema = z.object({
	allowedgear: shape.allowedgear,
	geargenreenforced: shape.geargenreenforced,
	name: shape.name
})

export type FormSchema = typeof formSchema
