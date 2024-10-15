import { z } from 'zod'
import { formSchema as gearSchema } from '$lib/schemas/edit/editgearschema'

const { shape } = gearSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	genres: shape.genres,
	onsale: shape.onsale,
	gearattributes: shape.gearattributes,
	limited: z.boolean()
})

export type FormSchema = typeof formSchema
