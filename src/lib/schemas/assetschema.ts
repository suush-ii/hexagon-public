import { z } from 'zod'
import type { AssetGenre } from '$lib/types'
import { assetGenreZod } from '$lib'

export const formSchema = z.object({
	name: z
		.string({ required_error: 'Name required.' })
		.min(1, { message: 'Name required.' })
		.max(50, { message: "Name can't be over 50 characters!" }),
	description: z.string().max(1000, { message: "Description can't be over 1000 characters!" }),
	price: z.coerce
		.number()
		.int({ message: 'Whole number please!' })
		.min(0, { message: 'Price must be at least 0!' })
		.max(999999999, { message: 'The maximum price for this is 999999999!' })
		.default(0),
	asset: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f: { size: number }) => f.size / Math.pow(1024, 2) < 10, 'Max 10 MB upload size.'),
	genres: z
		.array(z.enum(assetGenreZod))
		.min(1, { message: 'At least one genre!' })
		.max(5, { message: 'No more than 5 genres!' })
		.default(['All'])
})

export type FormSchema = typeof formSchema
