<script lang="ts">
	//import * as Avatar from '$src/components/ui/avatar'
	import Avatar from './avatar.svelte'
	import { MoonStar } from 'lucide-svelte'
	import RelativeTime from '@yaireo/relative-time'
	import { formatCompactNumber } from '$lib/utils'
	import { page } from '$app/stores'

	const relativeTime = new RelativeTime()

	import { slugify } from '$lib/utils'

	export let itemName: string

	export let creator: string

	export let creatorUserId: number

	export let updated: Date

	export let sales: number

	export let itemId: number

	export let cost: number | null

	export let favorites: number
</script>

<div
	class="flex flex-col w-24 2xl:w-32 group hover:outline-dashed outline-muted-foreground/20 outline-offset-8"
>
	<a href="/catalog/{itemId}/{slugify(itemName)}">
		<Avatar
			css="w-24 h-24 2xl:w-32 2xl:h-32 rounded-xl aspect-square"
			{itemId}
			{itemName}
			disable3d={true}
		/>
		<h1 class="line-clamp-2 tracking-tighter break-words 2xl:text-xl hover:underline">
			{itemName}
		</h1>
		<h1 class="tracking-tighter truncate text-sm flex flex-row">
			<MoonStar class="h-5" />{cost}
		</h1>
	</a>
	<div class="invisible group-hover:visible flex text-xs pt-2 flex-col gap-y-1">
		<h5 class="text-muted-foreground line-clamp-2 break-all">
			{$page.data.t('catalog.creator')}:
			<a class="text-foreground hover:underline" href="/users/{creatorUserId}/profile">{creator}</a>
		</h5>
		<h5 class="text-muted-foreground">
			{$page.data.t('assetGeneric.updated')}:
			<span class="text-foreground">{relativeTime.from(updated)}</span>
		</h5>
		<h5 class="text-muted-foreground">
			{$page.data.t('catalog.sales')}:
			<span class="text-foreground">{formatCompactNumber(sales, false)}</span>
		</h5>
		<h5 class="text-muted-foreground">
			{$page.data.t('catalog.favorited')}:
			<span class="text-foreground"
				>{formatCompactNumber(favorites, false)} {favorites === 1 ? 'time' : 'times'}</span
			>
		</h5>
	</div>
</div>
