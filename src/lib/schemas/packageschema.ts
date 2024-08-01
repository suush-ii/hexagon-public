import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'

const { shape } = assetSchema

export const formSchema = z.object({
	bundleid: z.coerce.number().positive(),
	price: shape.price,
	assetversion: z.coerce.number().positive().default(1)
})

export type FormSchema = typeof formSchema
