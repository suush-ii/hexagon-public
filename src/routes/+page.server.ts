import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms/server";
import { formSchema } from "$lib/schemas/signupschema";
import { fail, redirect } from "@sveltejs/kit";

  export const load: PageServerLoad = () => {
    return {
      form: superValidate(formSchema)
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
      
      throw redirect(301, "/home")
    }
  };