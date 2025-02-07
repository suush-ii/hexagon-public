import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'
import { assetGenreZod } from '$src/lib'
const { shape } = assetSchema

export const ideAssetSchema = z.object({
	Name: shape.name,
	Description: shape.description,
	Genre: z.enum(assetGenreZod).default('All')
})
