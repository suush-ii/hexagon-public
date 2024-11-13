import { z } from 'zod'

export const formSchema = z.object({
	maintenanceEnabled: z.boolean(),
	registrationEnabled: z.boolean(),
	keysEnabled: z.boolean(),
	gamesEnabled: z.boolean(),
	developEnabled: z.boolean(),
	applicationsEnabled: z.boolean(),
	coneHat: z.coerce.number().optional(),
	jamrioHat: z.coerce.number().optional(),
	wuffHat: z.coerce.number().optional()
})

export type FormSchema = typeof formSchema
