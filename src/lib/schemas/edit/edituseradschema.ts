import { z } from 'zod'
import { formSchema as userAdSchema } from '$lib/schemas/useradschema'

const { shape } = userAdSchema

export const formSchema = z.object({
	name: shape.name
})

export type FormSchema = typeof formSchema
