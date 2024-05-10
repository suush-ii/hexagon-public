import { z } from 'zod'
import { assetGenreZod } from '$lib'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'

const { shape } = assetSchema

export const formSchema = z.object({
	name: z
		.string({ required_error: 'Game name required.' })
		.min(1, { message: 'Game name required.' })
		.max(50, { message: "Game name can't be over 50 characters!" }),
	description: z.string().max(1000, { message: "Description can't be over 1000 characters!" }),
	serversize: z.coerce
		.number()
		.int({ message: 'Whole number please!' })
		.min(1, { message: 'Minimum of 1 player!' })
		.max(50, { message: 'Maximum of 50 players!' })
		.default(30),
	/*thumbnail: z.any(),
	icon: z.any(),*/
	asset: shape.asset,
	genre: z.enum(assetGenreZod).default('All')
})

export type FormSchema = typeof formSchema
