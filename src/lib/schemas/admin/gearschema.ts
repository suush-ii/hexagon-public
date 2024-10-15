import { z } from 'zod'
import { formSchema as gearSchema } from '$lib/schemas/gearschema'
import { formSchema as assetSchema } from '$lib/schemas/admin/assetschema'

const { shape } = gearSchema
const { shape: shapeAsset } = assetSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	price: shape.price,
	asset: shape.asset,
	genres: shape.genres,
	gearattributes: shape.gearattributes,
	stock: shapeAsset.stock
})

export type FormSchema = typeof formSchema
