import { z } from 'zod'

export const moveSchema = z.object({
	userId: z.coerce.number().int().positive({ message: 'Userid must be a positive number!' })
})

export type MoveSchema = typeof moveSchema
