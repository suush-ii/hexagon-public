import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'

const { shape } = assetSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	asset: shape.asset,
	serversize: shape.serversize,
	genre: shape.genre
})

export type FormSchema = typeof formSchema
