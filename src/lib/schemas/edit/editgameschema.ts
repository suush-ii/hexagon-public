import { z } from 'zod'
import { formSchema as gameSchema } from '$lib/schemas/gameschema'

const { shape } = gameSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	serversize: shape.serversize,
	genre: shape.genre
})

export type FormSchema = typeof formSchema
