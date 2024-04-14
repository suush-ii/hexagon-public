import { z } from 'zod'

export const usernameSchema = z.object({
	username: z.string({ required_error: 'Username required.' }).min(3).max(20)
})

export const idSchema = z.object({
	userid: z.coerce.number().int().positive({ message: 'Userid must be a positive number!' })
})

export type UsernameSchema = typeof usernameSchema
export type IdSchema = typeof idSchema
