import { z } from 'zod'

export const usernameSchema = z.object({
	username: z.string({ required_error: 'Username required.' }).min(3).max(20)
})

export const idSchema = z.object({
	userid: z.coerce.number().int().positive({ message: 'Userid must be a positive number!' })
})

export const discordIdSchema = z.object({
	discordid: z.string({ required_error: 'Discord ID required.' })
})

export type UsernameSchema = typeof usernameSchema
export type IdSchema = typeof idSchema
export type DiscordIdSchema = typeof discordIdSchema
