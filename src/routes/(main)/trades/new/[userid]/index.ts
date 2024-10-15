import { z } from 'zod'

const trade = z.object({
	items: z.coerce.number().int().positive().array(),
	moons: z
		.literal('')
		.transform(() => undefined)
		.or(z.coerce.number().int().positive())
		.optional()
})

export const formSchema = z
	.object({
		offering: trade,
		requesting: trade
	})
	.refine(
		(data) => {
			const hasOffering = data.offering.items.length > 0 || data.offering.moons !== undefined
			const hasRequesting = data.requesting.items.length > 0 || data.requesting.moons !== undefined
			return hasOffering || hasRequesting
		},
		{
			message: 'Empty trade.'
		}
	)
	.refine(
		(data) => {
			const hasOffering = data.offering.items.length > 0 || data.offering.moons !== undefined
			const hasRequesting = data.requesting.items.length > 0 || data.requesting.moons !== undefined
			// Allow offering without requesting, but not requesting without offering
			return hasOffering || !hasRequesting
		},
		{
			message: 'Must offer to request.'
		}
	)

export type FormSchema = typeof formSchema
