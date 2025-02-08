import { z } from 'zod'
import { formSchema as _2faSchema } from '$src/lib/schemas/2faenableschema'

const { shape } = _2faSchema

export const formSchema = z.object({
	code: shape.code
})

export type FormSchema = typeof formSchema
