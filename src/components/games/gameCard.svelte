<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'

	import { formatCompactNumber } from '$lib/utils'

	import { slugify } from '$lib/utils'

	export let gameName: string

	export let gameId: number

	export let playerCount: number

	export let iconUrl: string
</script>

<a href="/games/{gameId}/{slugify(gameName)}"
	><div class="flex flex-col w-32">
		<Avatar.Root class="w-32 h-32 rounded-xl">
			<Avatar.Image
				src={iconUrl ? iconUrl : '/Images/iconplaceholder.png'}
				alt={gameName}
				loading="lazy"
			/>
			<Avatar.Fallback />
		</Avatar.Root>
		<h1 class="line-clamp-2 tracking-tighter break-words text-xl">{gameName}</h1>
		<h1 class="tracking-tighter truncate text-xs">{formatCompactNumber(playerCount)} Playing</h1>
	</div></a
>
