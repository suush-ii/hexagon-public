import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import { count, eq } from 'drizzle-orm'
import { assetTable, assetVersionsTable } from '$lib/server/schema/assets'
import { error, fail, redirect } from '@sveltejs/kit'
import { adminAssets } from '../../'
import { formSchema as updateAssetSchema } from '$lib/schemas/edit/updateassetschema'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { RateLimiter } from 'sveltekit-rate-limiter/server'
import { createHash } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName } from '$src/stores'
import { S3 } from '$lib/server/s3'

const limiter = new RateLimiter({
	IP: [1, '15s']
})

export const load: PageServerLoad = async ({ params }) => {
	const asset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, Number(params.assetid)),
		columns: { assetType: true }
	})

	if (!asset) {
		return error(404, { success: false, message: 'Asset not found.', data: {} })
	}

	if (!adminAssets.includes(asset.assetType) || asset.assetType === 'packages') {
		return error(403, {
			success: false,
			message: 'You do not have permission to update this asset.',
			data: {}
		})
	}

	return {
		updateAssetForm: await superValidate(zod(updateAssetSchema))
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(updateAssetSchema))

		if (!form.valid) {
			return fail(400, {
				form
			})
		}

		const { asset: file } = form.data
		const { params } = event

		if (await limiter.isLimited(event)) {
			return error(429, {
				success: false,
				message: 'Your uploading too fast!',
				data: {}
			})
		}

		const asset = await db.query.assetTable.findFirst({
			where: eq(assetTable.assetid, Number(params.assetid)),
			columns: { simpleasseturl: true }
		})

		if (!asset) {
			return error(404, { success: false, message: 'Asset not found.', data: {} })
		}

		const fileBuffer = Buffer.from(await file.arrayBuffer())

		const fileName = Buffer.from(createHash('sha512').update(fileBuffer).digest('hex')).toString()

		let Key = params.item

		if (
			params.item === 'l arms' ||
			params.item === 'l legs' ||
			params.item === 'r arms' ||
			params.item === 'r legs' ||
			params.item === 'torsos'
		) {
			Key = 'packages'
		}

		const command = new PutObjectCommand({
			Bucket: s3BucketName,
			Key: Key + '/' + fileName,
			Body: fileBuffer,
			ContentType: file.type
		})
		try {
			await S3.send(command)
		} catch (err) {
			console.log(err)

			return fail(500, {
				form
			})
		}

		await db
			.update(assetTable)
			.set({ simpleasseturl: fileName, assetrender: null, _3dmanifest: null, updated: new Date() })
			.where(eq(assetTable.assetid, Number(params.assetid)))

		const [assetVersionsCount] = await db
			.select({ count: count() })
			.from(assetVersionsTable)
			.where(eq(assetVersionsTable.assetid, Number(params.assetid)))
			.limit(1)

		if (assetVersionsCount.count <= 0) {
			await db.insert(assetVersionsTable).values({
				assetid: Number(params.assetid),
				filehash: asset.simpleasseturl ?? ''
			})
		}

		await db.insert(assetVersionsTable).values({
			assetid: Number(params.assetid),
			filehash: fileName
		})

		return redirect(302, `/admin/catalog/upload/${params.item}`)
	}
}
