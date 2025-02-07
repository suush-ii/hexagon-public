import { getPageNumber } from '$lib/utils'
import { type RequestHandler, error, json } from '@sveltejs/kit'
import { z } from 'zod'
import { getAssetSet } from './defaultsets'

export const GET: RequestHandler = async ({ url, params }) => {
	const result = await z.number().safeParseAsync(Number(params.set))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	let page = getPageNumber(url)

	let size = 30

	const set = getAssetSet(Number(params.set))

	if (!set) {
		error(404, { success: false, message: 'Set not found.' })
	}

	const total = set.items.length

	set.items = set.items.slice((page - 1) * size, page * size)

	const Results = set.items.map((item) => ({
		Asset: {
			Id: item.assetId,
			Name: item.assetName,
			TypeId: 10,
			IsEndorsed: false
		},
		Creator: {
			Id: 1,
			Name: 'Hexagon',
			Type: 1
		},
		Thumbnail: {
			Final: true,
			Url: 'http://hexagon.pw/Thumbs/Asset.ashx?assetId=' + item.assetId,
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

	return json({ TotalResults: total, Results })
}
