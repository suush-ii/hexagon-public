import type { assetStates } from '$lib/types'
import { s3Url } from '$src/stores'
import pending from '$lib/icons/iconpending.png'
import rejected from '$lib/icons/iconrejected.png'

export function getImage(
	assetUrl: string | undefined | null,
	moderationState: assetStates | undefined
) {
	if (moderationState === 'pending') {
		return pending
	}

	if (moderationState === 'rejected') {
		return rejected
	}

	if (assetUrl) {
		return `https://${s3Url}/images/${assetUrl}`
	}

	return '/Images/iconplaceholder.png'
}
