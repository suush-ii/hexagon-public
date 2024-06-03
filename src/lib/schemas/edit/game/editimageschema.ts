import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'

const { shape } = assetSchema

export const formSchema = z.object({
	asset: shape.asset,
	type: z.enum(['thumbnail', 'icon'])
})

export type FormSchema = typeof formSchema
