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

export const load: PageServerLoad = async ({ url }) => {
	const animation = await z.coerce
		.string()
		.transform((val) => val === 'true')
		.default('false')
		.safeParseAsync(url.searchParams.get('animation'))

	if (!animation.success) {
		return error(400, { success: false, message: 'invalid form', data: {} })
	}

	return {
		baseurl: env.BASE_URL,
		animation: animation.data
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(ideAssetSchema))
		if (!form.valid) {
			return error(400, { success: false, message: 'invalid form', data: {} })
		}

		const animation = await z.coerce
			.string()
			.transform((val) => val === 'true')
			.default('false')
			.safeParseAsync(event.url.searchParams.get('animation'))

		if (!animation.success) {
			return error(400, { success: false, message: 'invalid form', data: {} })
		}

		const user = event.locals.user

		if (!user) {
			error(401, { success: false, message: 'No session.', data: {} })
		}

		const { Name, Description, Genre } = form.data

		return redirect(
			302,
			`/UI/Upload.aspx?Name=${encodeURIComponent(Name)}&Description=${encodeURIComponent(Description)}&Genre=${encodeURIComponent(Genre)}&Animation=${animation.data}`
		)
	}
}
