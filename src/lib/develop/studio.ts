import DownloadModal from '$src/components/downloadModal.svelte'
import type { clientVersions } from '../types'

export function launchStudioScript(
	placeid: number,
	authBearer: string,
	baseurl: string,
	downloadModal: DownloadModal,
	launchmode: 'ide' | 'build',
	userid: number = 0,
	version: clientVersions
) {
	const script =
		launchmode === 'ide'
			? `http://www.${baseurl}/Game/edit.ashx?PlaceID=${placeid}`
			: `http://www.${baseurl}/Game/visit.ashx?PlaceID=${placeid}&UserID=${userid}&Build=true`

	const uri = `hexagon-studio:1+launchmode:${launchmode}+gameinfo:${authBearer}+script:${encodeURIComponent(script)}+version:${version}`

	downloadModal.open(uri)

	document.location = uri
}

export function launchStudio(authBearer: string, downloadModal: DownloadModal) {
	const uri = `hexagon-studio:1+launchmode:ide+gameinfo:${authBearer}`

	downloadModal.open(uri)

	document.location = uri
}
