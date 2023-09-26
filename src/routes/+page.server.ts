import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { formSchema } from '$lib/schemas/signupschema';
import { fail, redirect } from '@sveltejs/kit';
import { configTable } from '$src/lib/server/schema/config';
import { db } from '$src/lib/server/db';

export const load: PageServerLoad = async () => {
	const config = await db.select().from(configTable).limit(1);

	return {
		form: superValidate(formSchema),
		clicker: config?.[0]?.pageClicker ?? 0
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, formSchema);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		throw redirect(301, '/home');
	}
};
