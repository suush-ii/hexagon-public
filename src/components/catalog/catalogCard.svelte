<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { MoonStar } from 'lucide-svelte'
	import RelativeTime from '@yaireo/relative-time'
	import { formatCompactNumber } from '$lib/utils'

	const relativeTime = new RelativeTime()

	import { slugify } from '$lib/utils'

	export let itemName: string

	export let creator: string

	export let creatorUserId: number

	export let updated: Date

	export let sales: number

	export let itemId: number

	export let cost: number | null
</script>

<div
	class="flex flex-col w-32 group hover:outline-dashed outline-muted-foreground/20 outline-offset-8"
>
	<a href="/catalog/{itemId}/{slugify(itemName)}">
		<Avatar.Root class="w-32 h-32 rounded-xl aspect-square">
			<Avatar.Image src={'/Images/iconplaceholder.png'} alt={itemName} loading="lazy" />
			<Avatar.Fallback />
		</Avatar.Root>
		<h1 class="line-clamp-2 tracking-tighter break-words text-xl hover:underline">{itemName}</h1>
		<h1 class="tracking-tighter truncate text-sm flex flex-row">
			<MoonStar class="h-5" />{cost}
		</h1>
	</a>
	<div class="invisible group-hover:visible flex text-xs pt-2 flex-col gap-y-1">
		<h5 class="text-muted-foreground line-clamp-2 break-all">
			Creator: <a class="text-foreground hover:underline" href="/users/{creatorUserId}/profile"
				>{creator}</a
			>
		</h5>
		<h5 class="text-muted-foreground">
			Updated: <span class="text-foreground">{relativeTime.from(updated)}</span>
		</h5>
		<h5 class="text-muted-foreground">
			Sales: <span class="text-foreground">{formatCompactNumber(sales)}</span>
		</h5>
		<h5 class="text-muted-foreground">Favorited: <span class="text-foreground">1 time</span></h5>
	</div>
</div>
