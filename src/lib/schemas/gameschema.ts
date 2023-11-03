import { z } from 'zod'

export const formSchema = z.object({
	gamename: z.string({ required_error: 'Game name required.' }).min(1, { message: 'Game name required.' }).max(50, { message: "Game name can't be over 20 characters!" }),
	description: z.string().max(1000, { message: "Description can't be over 1000 characters!" }),
	serversize: z.coerce.number().int({"message": "Whole number please!"}).min(1, { message: "Minimum of 1 player!" }).max(50, { message: "Maximum of 50 players!" }),
	/*thumbnail: z.any(),
	icon: z.any(),*/
	game: z.any()
})

export type FormSchema = typeof formSchema
