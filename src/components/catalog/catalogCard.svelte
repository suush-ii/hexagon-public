<script lang="ts">
	//import * as Avatar from '$src/components/ui/avatar'
	import Avatar from './avatar.svelte'
	import { Cog, MoonStar } from 'lucide-svelte'
	import RelativeTime from '@yaireo/relative-time'
	import { formatCompactNumber } from '$lib/utils'
	import { page } from '$app/stores'

	const relativeTime = new RelativeTime()

	import { slugify } from '$lib/utils'
	import Button from '../ui/button/button.svelte'

	export let itemName: string

	export let creator: string

	export let creatorUserId: number

	export let updated: Date

	export let sales: number

	export let itemId: number

	export let cost: number | null

	export let favorites: number

	export let limited: string | null

	export let recentaverageprice: number | null

	export let inventoryId: number = 0
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
		>
			{#if inventoryId && ($page.data?.user?.role === 'owner' || $page.data?.user?.role === 'manager')}
				<Button
					size="icon"
					variant="outline"
					class="absolute right-0 top-0"
					href="/admin/users/inventory/{inventoryId}"
				>
					<Cog /></Button
				>
			{/if}

			{#if limited}
				<div class="h-7 absolute left-0 bottom-0">
					<img class="w-full h-full" src="/Images/{limited}.svg" alt={limited} />
				</div>{/if}
		</Avatar>
		<h1 class="line-clamp-2 tracking-tighter break-words 2xl:text-xl hover:underline">
			{itemName}
		</h1>
		<h1 class="tracking-tighter truncate text-sm flex flex-col gap-y-1">
			{#if limited && recentaverageprice}
				<h5 class="flex gap-x-[0.35rem]">
					<span class="font-semibold">was</span><MoonStar class="h-5" />{formatCompactNumber(
						cost ?? 0,
						false
					)}
				</h5>

				<h5 class="flex gap-x-1">
					<span>now</span><MoonStar class="h-5" />{formatCompactNumber(
						recentaverageprice ?? 0,
						false
					)}
				</h5>
			{/if}

			{#if !limited || !recentaverageprice}
				<div class="flex">
					<MoonStar class="h-5" />{formatCompactNumber(cost ?? 0, false)}
				</div>
			{/if}
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
