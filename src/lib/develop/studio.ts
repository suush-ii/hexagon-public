import DownloadModal from '$src/components/downloadModal.svelte'

export function launchStudio(
	placeid: number,
	authBearer: string,
	baseurl: string,
	downloadModal: DownloadModal
) {
	const uri = `hexagon-studio:1+launchmode:ide+gameinfo:${authBearer}+script:${encodeURIComponent(`http://www.${baseurl}/Game/edit.ashx?PlaceID=${placeid}`)}`

	downloadModal.open(uri)

	document.location = uri
}
