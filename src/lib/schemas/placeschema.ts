import { z } from 'zod'
import { gearAttributesZod } from '$lib'
import { formSchema as gameSchema } from '$lib/schemas/gameschema'

const { shape } = gameSchema

export const formSchema = z.object({
	asset: shape.asset,
	allowedgear: z.array(z.enum(gearAttributesZod)).default([]),
	geargenreenforced: z.boolean().default(true),
	name: shape.name
})

export type FormSchema = typeof formSchema
