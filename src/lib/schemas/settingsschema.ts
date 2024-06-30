import { z } from 'zod'
import { formSchema as signUpSchema } from './signupschema'

const { shape } = signUpSchema

export const formSchema = z.object({
	blurb: z.string().max(1000, { message: "Blurb can't be over 1000 characters!" })
})

export type FormSchema = typeof formSchema

export const formSchemaPassword = z.object({
	currentpassword: shape.password,
	password: shape.password
})

export type FormSchemaPassword = typeof formSchemaPassword
