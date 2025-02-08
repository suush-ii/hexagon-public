import { z } from 'zod'
import { formSchema as signUpSchema } from '$lib/schemas/signupschema'
import { formSchema as _2faSchema } from '$src/lib/schemas/2faenableschema'

const { shape } = signUpSchema
const { shape: _2faShape } = _2faSchema

export const formSchema = z.object({
	username: shape.username,
	password: shape.password,
	_2facode: _2faShape.code.optional()
})

export type FormSchema = typeof formSchema
