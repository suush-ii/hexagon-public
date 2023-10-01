import { z } from 'zod';
import { validateSchema } from '$lib/schemas/signupschema';

const { shape } = validateSchema;

export const formSchema = z.object({
	username: shape.username,
	password: shape.password
});

export type FormSchema = typeof formSchema;
