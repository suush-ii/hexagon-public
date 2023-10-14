import { z } from 'zod'
import { formSchema as signUpSchema } from '$lib/schemas/signupschema'

const { shape } = signUpSchema

export const formSchema = z.object({
	username: shape.username,
	password: shape.password
})

export type FormSchema = typeof formSchema
