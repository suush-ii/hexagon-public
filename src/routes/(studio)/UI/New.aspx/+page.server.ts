import type { PageServerLoad, Actions } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { env } from '$env/dynamic/private'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { formSchema as assetSchema } from '$lib/schemas/assetschema'
import { assetGenreZod } from '$src/lib'
export const csr = false

const { shape } = assetSchema

const ideAssetSchema = z.object({
	Name: shape.name,
	Description: shape.description,
	Genre: z.enum(assetGenreZod).default('All')
})

export const load: PageServerLoad = async () => {
	return {
		baseurl: env.BASE_URL
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(ideAssetSchema))
		if (!form.valid) {
			return error(400, { success: false, message: 'invalid form', data: {} })
		}

		const user = event.locals.user

		if (!user) {
			error(401, { success: false, message: 'No session.', data: {} })
		}

		const { Name, Description, Genre } = form.data

		return redirect(
			302,
			`/UI/Upload.aspx?Name=${encodeURIComponent(Name)}&Description=${encodeURIComponent(Description)}&Genre=${encodeURIComponent(Genre)}`
		)
	}
}
