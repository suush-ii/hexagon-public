import { db } from '$lib/server/db'
import { commonWhereLibrary } from '$src/lib/server/catalog'
import { assetTable } from '$src/lib/server/schema'
import type { AssetTypes } from '$src/lib/types'
import { getPageNumber } from '$src/lib/utils'
import { type RequestHandler, error, json } from '@sveltejs/kit'
import { and, count, desc, eq, ilike } from 'drizzle-orm'
import { z } from 'zod'

const toolboxSchema = z.object({
	category: z.enum([
		'FreeModels',
		'FreeDecals',
		'FreeMeshes',
		'FreeAudio',
		'RecentDecals',
		'RecentModels',
		'MyModels',
		'MyDecals'
	]),
	keyword: z.string(),
	sort: z.enum(['Relevance']),
	creatorId: z.coerce.number().int().optional()
})

function enumFromAssetType(value: AssetTypes): number {
	switch (value) {
		case 'models':
			return 10
		case 'decals':
			return 13
		case 'meshes':
			return 4
		case 'audio':
			return 3
	}
	return 0
}

export const GET: RequestHandler = async ({ url }) => {
	const result = await toolboxSchema.safeParseAsync({
		category: url.searchParams.get('category'),
		keyword: url.searchParams.get('keyword'),
		sort: url.searchParams.get('sort'),
		creatorId: url.searchParams.get('creatorId')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const { category, keyword } = result.data

	let page = getPageNumber(url)

	const size = 30

	let assetType: AssetTypes

	if (category === 'FreeModels' || category === 'RecentModels' || category === 'MyModels') {
		assetType = 'models'
	} else if (category === 'FreeDecals' || category === 'RecentDecals' || category === 'MyDecals') {
		assetType = 'decals'
	} else if (category === 'FreeMeshes') {
		assetType = 'meshes'
	} else if (category === 'FreeAudio') {
		assetType = 'audio'
	} else {
		error(400, { success: false, message: 'Invalid category.' })
	}

	let creatorWhere = undefined

	if (result.data.creatorId) {
		creatorWhere = eq(assetTable.creatoruserid, result.data.creatorId)
	}

	const [itemscount] = await db
		.select({ count: count() })
		.from(assetTable)
		.where(
			and(
				commonWhereLibrary,
				ilike(assetTable.assetname, `%${keyword}%`),
				eq(assetTable.assetType, assetType),
				creatorWhere
			)
		)

	if (itemscount.count < (page - 1) * size) {
		page = 1
	}

	const items = await db.query.assetTable.findMany({
		where: and(
			commonWhereLibrary,
			ilike(assetTable.assetname, `%${keyword}%`),
			eq(assetTable.assetType, assetType),
			creatorWhere
		), // library assets
		columns: {
			assetname: true,
			assetid: true
		},
		with: {
			author: {
				columns: {
					username: true,
					userid: true
				}
			}
		},
		orderBy: desc(assetTable.updated),
		limit: size,
		offset: (page - 1) * size
	})

	const Results = items.map((item) => ({
		Asset: {
			Id: item.assetid,
			Name: item.assetname,
			TypeId: enumFromAssetType(assetType),
			IsEndorsed: false
		},
		Creator: {
			Id: item.author.userid,
			Name: item.author.username,
			Type: 1
		},
		Thumbnail: {
			Final: true,
			Url: 'http://hexagon.pw/Thumbs/Asset.ashx?assetId=' + item.assetid,
			RetryUrl: null,
			UserId: 0,
			EndpointType: 'Avatar'
		},
		Voting: {
			ShowVotes: false,
			UpVotes: 0,
			DownVotes: 0,
			CanVote: false,
			UserVote: null,
			HasVoted: false,
			ReasonForNotVoteable: 'InvalidAssetOrUser'
		}
	}))

	return json({ TotalResults: itemscount.count, Results })
}
