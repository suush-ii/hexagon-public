import { eq, or } from 'drizzle-orm'
import { db } from './db'
import { usersTable } from './schema'
import { S3 } from '$lib/server/s3'
import { DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { s3BucketName, s3Url } from '$src/stores'

export async function renderClear(userid: number) {
	const render = await db.query.usersTable.findFirst({
		where: eq(usersTable.userid, userid),
		columns: {
			avatarbody: true,
			avatarheadshot: true,
			_3dmanifest: true
		}
	})

	if (!render) {
		return
	}

	const beingUsed = await db.query.usersTable.findFirst({
		where: or(
			eq(usersTable.avatarbody, render.avatarbody ?? ''),
			eq(usersTable.avatarheadshot, render.avatarheadshot ?? ''),
			eq(usersTable._3dmanifest, render._3dmanifest ?? '')
		),
		columns: {
			userid: true
		}
	})

	if (!beingUsed || beingUsed.userid == userid) {
		const Key = 'thumbnails'

		let Objects = []

		if (render.avatarbody) {
			Objects.push({ Key: `${Key}/${render.avatarbody}` })
		}

		if (render.avatarheadshot) {
			Objects.push({ Key: `${Key}/${render.avatarheadshot}` })
		}

		const command = new DeleteObjectsCommand({
			Bucket: s3BucketName,
			Delete: {
				Objects
			}
		})

		console.log(Objects)

		try {
			await S3.send(command)
		} catch (err) {
			console.log(err)
		}

		if (render._3dmanifest) {
			const manifest = await fetch(`https://${s3Url}/${Key}/${render._3dmanifest}`)

			if (manifest.ok) {
				const data = await manifest.json()

				if (data?.textures) {
					let Objects = []

					if (data?.mtl) {
						Objects.push({ Key: `${Key}/${data.mtl}` })
					}

					if (data?.obj) {
						Objects.push({ Key: `${Key}/${data.obj}` })
					}

					const command = new DeleteObjectsCommand({
						Bucket: s3BucketName,
						Delete: {
							Objects
						}
					})

					console.log(Objects)

					try {
						await S3.send(command)
					} catch (err) {
						console.log(err)
					}
				}
			}
		}
	}
}
