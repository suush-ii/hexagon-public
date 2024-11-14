<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { slugify } from '$lib/utils'
	import type { assetStates } from '$lib/types'
	import { getImage } from '$lib/games/getImage'

	export let gameName: string

	export let gameId: number

	export let assetUrl: string | undefined | null | unknown
	export let moderationState: assetStates | undefined | null

	$: iconUrl = getImage(assetUrl, moderationState, 'icon')
</script>

<a href="/games/{gameId}/{slugify(gameName)}"
	><div class="flex flex-col w-12">
		<Avatar.Root class="w-12 h-12 rounded-xl">
			<Avatar.Image src={iconUrl} alt={gameName} loading="lazy" />
			<Avatar.Fallback />
		</Avatar.Root>
	</div></a
>
