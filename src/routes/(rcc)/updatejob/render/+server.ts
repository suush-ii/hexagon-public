import { json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { assetTable, jobsTable } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { createHash } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName } from '$src/stores'
import { S3 } from '$lib/server/s3'
const Key = 'thumbnails'

export const POST: RequestHandler = async ({ url, request }) => {
	const { itemid, render } = await request.json()

	const fileBuffer = Buffer.from(render, 'base64')

	const fileName = Buffer.from(createHash('sha512').update(fileBuffer).digest('hex')).toString()

	const command = new PutObjectCommand({
		Bucket: s3BucketName,
		Key: Key + '/' + fileName,
		Body: fileBuffer,
		ContentType: 'image/png'
	})
	try {
		await S3.send(command)
	} catch (err) {
		console.log(err)

		return json({
			success: false,
			message: 'Unknown error',
			data: {}
		})
	}

	await db.update(assetTable).set({ assetrender: fileName }).where(eq(assetTable.assetid, itemid))

	return json({
		success: true,
		message: '',
		data: {}
	})
}
