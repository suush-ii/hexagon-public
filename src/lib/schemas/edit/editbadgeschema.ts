import { z } from 'zod'
import { formSchema as badgeSchema } from '$lib/schemas/badgeschema'

const { shape } = badgeSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description
})

export type FormSchema = typeof formSchema
