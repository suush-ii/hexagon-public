import type { assetStates, AssetTypes } from '$lib/types'
import { s3Url } from '$src/stores'
import pendingIcon from '$lib/icons/iconpending.png'
import rejectedIcon from '$lib/icons/iconrejected.png'

export function getImage(
	assetUrl: string | undefined | null | unknown,
	moderationState: assetStates | undefined | null,
	size: 'thumbnail' | 'icon'
) {
	// TODO: dedicated thumbnail sized icons for pending and rejected states
	if (moderationState === 'pending' /*&& size === 'icon*/) {
		return pendingIcon
	}

	if (moderationState === 'rejected' /*&& size === 'icon'*/) {
		return rejectedIcon
	}

	if (assetUrl) {
		return `https://${s3Url}/images/${assetUrl}`
	}

	if (size === 'icon') {
		return '/Images/iconplaceholder.png'
	}

	return '/Images/thumbnailplaceholder.png'
}
