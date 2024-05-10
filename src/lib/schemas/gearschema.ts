import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'
import { gearAttributesZod } from '$lib'

const { shape } = assetSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	asset: shape.asset,
	genres: shape.genres,
	gearattributes: z.array(z.enum(gearAttributesZod))
})

export type FormSchema = typeof formSchema
