import { z } from 'zod'
import { formSchema as gameSchema } from '$lib/schemas/gameschema'
import { clientVersionsZod } from '$lib'

const { shape } = gameSchema

export const formSchema = z.object({
	name: shape.name,
	description: shape.description,
	serversize: shape.serversize,
	genre: shape.genre,
	clientversion: z.enum(clientVersionsZod)
})

export type FormSchema = typeof formSchema
