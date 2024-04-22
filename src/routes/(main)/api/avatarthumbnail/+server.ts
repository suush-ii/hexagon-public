import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { jobsTable, usersTable } from '$src/lib/server/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { GAMESERVER_IP } from '$env/static/private'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName, s3Url } from '$src/stores'
import { createHash } from 'node:crypto'
import { S3 } from '$lib/server/s3'
const Key = 'thumbnails'

const avatarSchema = z.object({
	type: z.enum(['headshot', 'avatar']),
	userid: z.coerce.number().int()
})

export const POST: RequestHandler = async ({ request }) => {
	let userid: number
	let type: 'headshot' | 'avatar'
	let result
	try {
		;({ userid, type } = await request.json())
		result = await avatarSchema.safeParseAsync({ type, userid })
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const user = await db.select().from(usersTable).where(eq(usersTable.userid, userid)).limit(1)

	if (user.length === 0) {
		return error(404, {
			success: true,
			message: "This user doesn't exist!",
			data: {}
		})
	}

	const instance = await db
		.select()
		.from(jobsTable)
		.where(eq(jobsTable.associatedid, userid))
		.limit(1)

	if (instance.length > 0) {
		return json({
			success: true,
			message: '',
			data: { url: '', status: 'pending' }
		})
	}

	if (type === 'avatar') {
		if (!user[0].avatarbody) {
			// we need to generate it
			const [instanceNew] = await db
				.insert(jobsTable)
				.values({
					associatedid: userid,
					type: 'render',
					clientversion: '2014'
				})
				.returning({ jobid: jobsTable.jobid })

			const response = await fetch(
				`http://${GAMESERVER_IP}:8000/openrender2016/${instanceNew.jobid}/${userid}/false`
			)

			const fileBuffer = Buffer.from(await response.text(), 'base64')

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

			await db.update(usersTable).set({ avatarbody: fileName }).where(eq(usersTable.userid, userid))

			await db.delete(jobsTable).where(eq(jobsTable.jobid, instanceNew.jobid))

			return json({
				success: true,
				message: '',
				data: { url: `https://${s3Url}/${Key}/${fileName}`, status: 'completed' }
			})
		} else {
			const url = `https://${s3Url}/${Key}/${user[0].avatarbody}`
			// it does exist return cdn url!
			return json({
				success: true,
				message: '',
				data: { url: url, status: 'completed' }
			})
		}
	}

	if (type === 'headshot') {
		if (!user[0].avatarheadshot) {
			// we need to generate it
			const [instanceNew] = await db
				.insert(jobsTable)
				.values({
					associatedid: userid,
					type: 'render',
					clientversion: '2014'
				})
				.returning({ jobid: jobsTable.jobid })

			const response = await fetch(
				`http://${GAMESERVER_IP}:8000/openrender2016/${instanceNew.jobid}/${userid}/true`
			)

			const fileBuffer = Buffer.from(await response.text(), 'base64')

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

			await db
				.update(usersTable)
				.set({ avatarheadshot: fileName })
				.where(eq(usersTable.userid, userid))

			await db.delete(jobsTable).where(eq(jobsTable.jobid, instanceNew.jobid))

			return json({
				success: true,
				message: '',
				data: { url: `https://${s3Url}/${Key}/${fileName}`, status: 'completed' }
			})
		} else {
			// it does exist return cdn url!
			const url = `https://${s3Url}/${Key}/${user[0].avatarheadshot}`
			return json({
				success: true,
				message: '',
				data: { url: url, status: 'completed' }
			})
		}
	}

	return json({ success: true, message: '', data: { url: '', status: 'pending' } }) // we are generating...
}
