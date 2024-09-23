import { z } from 'zod'

export const formSchema = z.object({
	maintenanceEnabled: z.boolean(),
	registrationEnabled: z.boolean(),
	keysEnabled: z.boolean(),
	gamesEnabled: z.boolean(),
	developEnabled: z.boolean(),
	applicationsEnabled: z.boolean()
})

export type FormSchema = typeof formSchema
