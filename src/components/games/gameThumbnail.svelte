<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { getImage } from '$lib/games/getImage'
	import type { assetStates } from '$lib/types'

	export let gamename: string

	export let size = 'xl:h-[360px] h-fit w-full max-w-[640px] shrink-0'

	export let assetUrl: string | undefined | null | unknown
	export let moderationState: assetStates | undefined | null

	let thumbnailUrl = getImage(assetUrl, moderationState, 'thumbnail')
</script>

<Avatar.Root class="{size} rounded-xl aspect-video">
	<Avatar.Image src={thumbnailUrl} alt={gamename} loading="lazy" />
	<Avatar.Fallback />
</Avatar.Root>
