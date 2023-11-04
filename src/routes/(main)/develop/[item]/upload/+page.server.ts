import type { PageServerLoad, Actions } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { formSchema } from '$src/lib/schemas/gameschema'
import { createHash } from 'node:crypto'
import { fail } from '@sveltejs/kit'
import { _uploadableAssets } from '../+layout'
import { appName } from '$src/stores'
import {
	CLOUDFLARE_S3_ACCESS_KEY,
	CLOUDFLARE_S3_ACCESS_KEY_ID,
	CLOUDFLARE_S3_ACCOUNT_ID
} from '$env/static/private'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { z } from 'zod'

const S3 = new S3Client({
	region: 'auto',
	endpoint: `https://${CLOUDFLARE_S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: CLOUDFLARE_S3_ACCESS_KEY_ID,
		secretAccessKey: CLOUDFLARE_S3_ACCESS_KEY
	}
})

export const load: PageServerLoad = async () => {
	return {
		form: superValidate(formSchema)
	}
}

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, formSchema)

		const result = await z.enum(['games', 'audio', 'decals']).safeParseAsync(params.item)

		if (result.success === false) {
			return fail(400, {
				form
			})
		}

		if (!form.valid) {
			return fail(400, {
				form
			})
		}
		let mimeTypes = _uploadableAssets[params.item].mimeTypes

		const file = formData.get('game')
		if (file instanceof File) {
			console.log(file.name)

			try {
				const fileBuffer = Buffer.from(await file.arrayBuffer())

				const fileName = Buffer.from(
					createHash('sha512').update(fileBuffer).digest('hex')
				).toString()

				//console.log(mimeTypes.some(e => e === file.type))

				//console.log(mimeTypes, file.type)

				if (mimeTypes.some((e) => e === file.type) === false) {
					return fail(400, {
						form
					})
				}

				const command = new PutObjectCommand({
					Bucket: appName,
					Key: params.item + '/' + fileName,
					Body: fileBuffer,
					ContentType: file.type
				})
				const result = await S3.send(command)
				//console.log('File uploaded successfully:', result);
			} catch (err) {
				return fail(500, {
					form
				})
			}
		}

		return {
			form
		}
	}
}
