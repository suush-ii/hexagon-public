import { env } from '$env/dynamic/private'
import { db } from '$src/lib/server/db'
import { assetTable, jobsTable } from '$src/lib/server/schema'
import { error, redirect, type RequestHandler } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import * as jose from 'jose'
import { s3Url } from '$src/stores'

export const GET: RequestHandler = async ({ params }) => {
	const accessKey = params.token

	let placeid

	try {
		const { payload } = await jose.jwtVerify(
			accessKey ?? '',
			new TextEncoder().encode(env.ASSET_ACCESS_KEY as string)
		)

		const job = await db.query.jobsTable.findFirst({
			where: eq(jobsTable.jobid, (payload?.jobid ?? '') as string),
			columns: {
				placeid: true,
				status: true
			}
		})

		if (job?.status === 2) {
			console.log('Warning something sus.')
		}

		if (!job || job.status != 1) {
			return error(403, {
				success: false,
				message: 'Invalid session.',
				data: {}
			})
		}

		placeid = job.placeid
	} catch {
		return error(403, {
			success: false,
			message: "You don't have permission to access this asset.",
			data: {}
		})
	}

	const existingAsset = await db.query.assetTable.findFirst({
		where: eq(assetTable.assetid, placeid!),
		columns: {
			assetType: true
		},
		with: {
			place: {
				columns: {
					placeurl: true
				}
			}
		}
	})

	redirect(302, `https://${s3Url}/${existingAsset?.assetType}/` + existingAsset?.place.placeurl)
}
