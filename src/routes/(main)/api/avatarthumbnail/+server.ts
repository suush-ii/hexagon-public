import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { jobsTable, usersTable, assetTable } from '$src/lib/server/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { GAMESERVER_IP } from '$env/static/private'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName, s3Url } from '$src/stores'
import { createHash } from 'node:crypto'
import { S3 } from '$lib/server/s3'
const Key = 'thumbnails'
import pending from '$lib/icons/iconpending.png'
import rejected from '$lib/icons/iconrejected.png'
import audio from '$lib/icons/audio.png'

const avatarSchema = z.object({
	type: z.enum(['headshot', 'avatar', 'obj']),
	assetid: z.coerce.number().int(),
	asset: z.enum(['user', 'item'])
})

export const POST: RequestHandler = async ({ request }) => {
	let assetid: number
	let type: 'headshot' | 'avatar' | 'obj'
	let asset: 'user' | 'item'
	let result
	try {
		;({ assetid, type, asset } = await request.json())
		result = await avatarSchema.safeParseAsync({ type, assetid, asset })
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (type === 'headshot' && asset === 'item') {
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const user =
		asset === 'user'
			? await db
					.select({
						avatarbody: usersTable.avatarbody,
						_3dmanifest: usersTable._3dmanifest,
						avatarheadshot: usersTable.avatarheadshot
					})
					.from(usersTable)
					.where(eq(usersTable.userid, assetid))
					.limit(1)
			: []

	const item =
		asset === 'item'
			? await db
					.select({
						moderationstate: assetTable.moderationstate,
						assetType: assetTable.assetType,
						simpleasseturl: assetTable.simpleasseturl,
						assetrender: assetTable.assetrender,
						_3dmanifest: assetTable._3dmanifest
					})
					.from(assetTable)
					.where(eq(assetTable.assetid, assetid))
					.limit(1)
			: []

	if (user.length === 0 && item.length === 0) {
		return error(404, {
			success: true,
			message: "This asset doesn't exist!",
			data: {}
		})
	}

	const userRender = user.length > 0 && asset === 'user'

	if (item?.[0]?.moderationstate !== 'approved' && asset === 'item') {
		if (item?.[0].moderationstate === 'rejected') {
			return json({
				success: true,
				message: '',
				data: { url: rejected, status: 'completed' }
			})
		}

		return json({
			success: true,
			message: '',
			data: { url: pending, status: 'completed' }
		})
	}

	if (item.length > 0 && asset === 'item') {
		if (item[0].assetType === 'images') {
			return json({
				success: true,
				message: '',
				data: {
					url: `https://${s3Url}/${item[0].assetType}/${item[0].simpleasseturl}`,
					status: 'completed'
				}
			})
		}

		if (item[0].assetType === 'audio') {
			return json({
				success: true,
				message: '',
				data: {
					url: audio,
					status: 'completed'
				}
			})
		}
	}

	const instance = await db
		.select({})
		.from(jobsTable)
		.where(eq(jobsTable.associatedid, assetid))
		.limit(1)

	if (instance.length > 0) {
		return json({
			success: true,
			message: '',
			data: { url: '', status: 'pending' }
		})
	}

	if (type === 'avatar' || type === 'obj') {
		if (!user?.[0]?.avatarbody && !item?.[0]?.assetrender) {
			// we need to generate it
			const [instanceNew] = await db
				.insert(jobsTable)
				.values({
					associatedid: assetid,
					type: 'render',
					clientversion: '2014'
				})
				.returning({ jobid: jobsTable.jobid })

			const response = await fetch(
				`http://${GAMESERVER_IP}:8000/${userRender ? 'openrender2016' : 'openrenderasset2016'}/${instanceNew.jobid}/${assetid}${userRender ? '/false' : ''}${item.length > 0 ? `/${item[0].assetType}` : ''}`
			)

			const responseJson = await response.json()

			if (responseJson.success === false) {
				await db.delete(jobsTable).where(eq(jobsTable.jobid, instanceNew.jobid))

				return json({ success: true, message: '', data: { url: '', status: 'pending' } })
			}

			const fileBuffer = Buffer.from(responseJson.image, 'base64')

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

			type axis = { x: number; y: number; z: number }

			const _3dManifest: {
				camera: { position: axis; direction: axis }
				AABB: { min: axis; max: axis }
				files: Record<string, { content: string }>
			} = JSON.parse(responseJson['_3d'])

			//console.log(_3dManifest.camera)

			//console.log(_3dManifest.AABB)

			let newManifest: {
				camera: { position: axis; direction: axis; fov: number }
				aabb: { min: axis; max: axis }
				mtl: string
				obj: string
				textures: string[]
			} = {
				camera: {
					position: _3dManifest.camera.position,
					direction: _3dManifest.camera.direction,
					fov: 70
				},
				aabb: _3dManifest.AABB,
				mtl: '',
				obj: '',
				textures: []
			}

			//console.log(Object.keys(_3dManifest.files).reverse())

			let mtlAssets: Record<string, string> = {}

			for (const [key, value] of Object.entries(_3dManifest.files).reverse()) {
				// reverse is important here so we can list the files first then change them to their hash in the mtl file as the mtl file comes before the textures
				// loop through all files and upload them / create the manifest for three.js
				const extension = key.split('.').pop()

				let fileContent: Buffer | string = Buffer.from(value.content, 'base64')

				let fileHash = Buffer.from(
					createHash('sha512').update(fileContent).digest('hex')
				).toString()

				if (extension === 'obj') {
					newManifest['obj'] = fileHash
				} else if (extension === 'mtl') {
					const pattern = new RegExp(Object.keys(mtlAssets).join('|'), 'g')

					fileContent = fileContent.toString()

					fileContent = fileContent.replace(pattern, (match) => `${mtlAssets[match]}`)

					fileHash = Buffer.from(createHash('sha512').update(fileContent).digest('hex')).toString()

					newManifest['mtl'] = fileHash
				} else {
					newManifest['textures'].push(fileHash)
					mtlAssets[key] = fileHash
				}

				const command = new PutObjectCommand({
					Bucket: s3BucketName,
					Key: 'thumbnails' + '/' + fileHash,
					Body: fileContent as Buffer,
					ContentType:
						extension === 'mtl' || extension === 'obj' ? `model/${extension}` : `image/${extension}`
				})

				try {
					await S3.send(command)
				} catch (err) {
					console.log(err)

					return error(400, {
						success: false,
						message: 'Unknown error',
						data: {}
					})
				}
			}

			// finally upload the manifest
			const _3dfileHash = Buffer.from(
				createHash('sha512').update(JSON.stringify(newManifest)).digest('hex')
			).toString()

			const commandManifest = new PutObjectCommand({
				Bucket: s3BucketName,
				Key: 'thumbnails' + '/' + _3dfileHash,
				Body: Buffer.from(JSON.stringify(newManifest)),
				ContentType: 'application/json'
			})

			try {
				await S3.send(commandManifest)
			} catch (err) {
				console.log(err)

				return error(400, {
					success: false,
					message: 'Unknown error',
					data: {}
				})
			}

			if (userRender) {
				await db
					.update(usersTable)
					.set({ avatarbody: fileName, _3dmanifest: _3dfileHash })
					.where(eq(usersTable.userid, assetid))
			} else {
				await db
					.update(assetTable)
					.set({ assetrender: fileName, _3dmanifest: _3dfileHash })
					.where(eq(assetTable.assetid, assetid))
			}

			await db.delete(jobsTable).where(eq(jobsTable.jobid, instanceNew.jobid))

			if (type === 'obj') {
				return json({
					success: true,
					message: '',
					data: { url: `https://${s3Url}/${Key}/${_3dfileHash}`, status: 'completed' }
				})
			}

			return json({
				success: true,
				message: '',
				data: { url: `https://${s3Url}/${Key}/${fileName}`, status: 'completed' }
			})
		} else {
			// it does exist return cdn url!
			if (type === 'obj') {
				return json({
					success: true,
					message: '',
					data: {
						url: `https://${s3Url}/${Key}/${user?.[0]?._3dmanifest ?? item[0]._3dmanifest}`,
						status: 'completed'
					}
				})
			}

			return json({
				success: true,
				message: '',
				data: {
					url: `https://${s3Url}/${Key}/${user?.[0]?.avatarbody ?? item[0].assetrender}`,
					status: 'completed'
				}
			})
		}
	}

	if (type === 'headshot') {
		if (!user[0].avatarheadshot) {
			// we need to generate it
			const [instanceNew] = await db
				.insert(jobsTable)
				.values({
					associatedid: assetid,
					type: 'render',
					clientversion: '2014'
				})
				.returning({ jobid: jobsTable.jobid })

			const response = await fetch(
				`http://${GAMESERVER_IP}:8000/openrender2016/${instanceNew.jobid}/${assetid}/true`
			)

			const responseJson = await response.json()

			if (responseJson.success === false) {
				await db.delete(jobsTable).where(eq(jobsTable.jobid, instanceNew.jobid))

				return json({ success: true, message: '', data: { url: '', status: 'pending' } })
			}

			const fileBuffer = Buffer.from(responseJson.image, 'base64')

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
				.where(eq(usersTable.userid, assetid))

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
