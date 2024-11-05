import { z } from 'zod'

function isAlphaNumeric(str: string) {
	let code, i, len
	let underscores = 0

	for (i = 0, len = str.length; i < len; i++) {
		code = str.charCodeAt(i)

		if (
			!(code > 47 && code < 58) && // numeric (0-9)
			!(code > 64 && code < 91) && // upper alpha (A-Z)
			!(code === 95) && // underscore
			!(code > 96 && code < 123)
		) {
			// lower alpha (a-z)
			return false
		}
	}

	for (i = 0, len = str.length; i < len; i++) {
		code = str.charCodeAt(i)

		if (code === 95) {
			underscores += 1
		}
	}

	if (underscores > 1) {
		return false
	}

	return true
}

export async function isTaken(username: string) {
	const taken = await fetch('/api/account/exists', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username })
	})

	const takenJson = await taken.json()
	if (takenJson.success === true && takenJson.data.available === false) {
		return true
	} else {
		return false
	}
}

export const formSchema = z.object({
	username: z
		.string({ required_error: 'Username required.' })
		.min(3, { message: 'Username must be at least 3 characters!' })
		.max(20, { message: "Username can't be over 20 characters!" })
		.refine(
			(value) => isAlphaNumeric(value),
			'Only special characters allowed are one underscore.'
		),
	password: z
		.string({ required_error: 'Password required.' })
		.min(1, { message: 'Password required!' })
		.max(100, { message: "Password can't be over 100 characters!" }),
	key: z
		.string({ required_error: 'Key required.' })
		.min(1, { message: 'Key required.' })
		.max(100, { message: "Key can't be over 100 characters!" })
		.optional(),
	gender: z.enum(['male', 'female', 'nonbinary']).default('nonbinary'),
	application: z.string({ required_error: 'Application required.' }).uuid().optional()
})

export const applicationFormSchema = z.object({
	discover: z
		.string({ required_error: 'This field is required!' })
		.min(50, { message: 'Minimum 50 Characters!' })
		.max(1000),
	socialmedia: z.string({ required_error: 'This field is required!' }).max(200).min(10),
	pastrevivals: z.string({ required_error: 'This field is required!' }).max(1000),
	verificationPhrase: z.string({ required_error: 'This field is required!' }).min(8),
	referer: z.coerce.number().int().optional()
})

export type FormSchema = typeof formSchema
export type ApplicationFormSchema = typeof applicationFormSchema
