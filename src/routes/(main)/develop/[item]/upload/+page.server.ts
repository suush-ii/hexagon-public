import type { PageServerLoad, Actions } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$src/lib/schemas/gameschema'
import { fail } from '@sveltejs/kit'

export const load: PageServerLoad = async () => {
	return {
		form: superValidate(formSchema)
	}
}

export const actions: Actions = {
	default: async (event) => {
	  const form = await superValidate(event, formSchema);
	  if (!form.valid) {
		return fail(400, {
		  form
		});
	  }
	  
	  return {
		form
	  };
	}
  };