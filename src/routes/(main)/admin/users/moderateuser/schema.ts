import { z } from 'zod'

export const actions = [
	'None',
	'Warn',
	'Ban 1 Day',
	'Ban 3 Days',
	'Ban 7 Days',
	'Ban 14 Days',
	'Delete',
	'Poison'
] as const

export type Action = (typeof actions)[number]

export const moderationSchema = z.object({
	action: z.enum(actions),
	note: z.string().max(1000),
	internalnote: z.string().max(10),
	scrubusername: z.boolean().default(false),
	assetid: z.number().int().optional(),
	userid: z.number().int().optional()
})

export type ModerationSchema = typeof moderationSchema
