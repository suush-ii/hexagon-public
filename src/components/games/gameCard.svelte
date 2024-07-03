<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'

	import CatalogAvatar from '$src/components/catalog/avatar.svelte'

	import { formatCompactNumber } from '$lib/utils'

	import { slugify } from '$lib/utils'

	import { page } from '$app/stores'

	import { interpolate } from '$lib/poly-i18n/interpolate'

	export let gameName: string

	export let gameId: number

	export let playerCount: number

	export let iconId: number
</script>

<a href="/games/{gameId}/{slugify(gameName)}"
	><div class="flex flex-col w-24 2xl:w-32">
		{#if iconId}
			<CatalogAvatar
				css="w-24 h-24 2xl:w-32 2xl:h-32 rounded-xl aspect-square"
				itemId={iconId}
				itemName={gameName}
				disable3d={true}
			/>
		{:else}
			<Avatar.Root class="w-24 h-24 2xl:w-32 2xl:h-32 rounded-xl">
				<Avatar.Image src={'/Images/iconplaceholder.png'} alt={gameName} loading="lazy" />
				<Avatar.Fallback />
			</Avatar.Root>
		{/if}

		<h1 class="line-clamp-2 tracking-tighter break-words text-xl">{gameName}</h1>
		<h1 class="tracking-tighter truncate text-xs">
			{interpolate($page.data.t('games.playing'), {
				count: formatCompactNumber(playerCount, false)
			})}
		</h1>
	</div></a
>
