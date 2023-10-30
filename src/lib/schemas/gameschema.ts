import { z } from 'zod'

export const formSchema = z.object({
	gamename: z.string().min(1).max(50),
	description: z.string().max(1000),
	serversize: z.number().int().min(1).max(20),
	thumbnail: typeof window === 'undefined' ? z.null() : z.instanceof(File), // HACK!
	icon: typeof window === 'undefined' ? z.null() : z.instanceof(File),
	game: typeof window === 'undefined' ? z.null() : z.instanceof(File)
})

export type FormSchema = typeof formSchema
