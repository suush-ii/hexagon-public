import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/signupschema'

const { shape } = assetSchema

export const formSchema = z.object({
	password: shape.password,
	newpassword: shape.password
})

export type FormSchema = typeof formSchema
