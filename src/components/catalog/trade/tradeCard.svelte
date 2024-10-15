<script lang="ts">
	import Avatar from '../avatar.svelte'
	import { MoonStar } from 'lucide-svelte'
	import { formatCompactNumber, slugify } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	function move() {
		dispatch('move')
	}

	export let itemName: string

	export let itemId: number

	export let recentaverageprice: number

	export let originalprice: number

	export let serial: number

	export let sold: number

	export let selected: boolean

	export let tradeRequest: boolean = false
</script>

<div
	class="flex flex-col w-24 h-fit {selected
		? ''
		: tradeRequest
			? ''
			: '2xl:w-32'} group hover:outline-dashed outline-muted-foreground/20 outline-offset-6 hover:scale-105 relative z-50 hover:bg-background"
>
	<button type="button" on:click={move}
		><div class="flex flex-col">
			<a href="/catalog/{itemId}/{slugify(itemName)}" class="text-center"
				><h1
					class="line-clamp-2 tracking-tighter break-words {selected
						? ''
						: tradeRequest
							? ''
							: '2xl:text-xl'} hover:underline {selected ? 'invisible group-hover:visible ' : ''}"
				>
					{itemName}
				</h1></a
			>
			<Avatar
				css="w-24 h-24 {selected
					? ''
					: tradeRequest
						? ''
						: '2xl:w-32 2xl:h-32'} rounded-xl aspect-square"
				{itemId}
				{itemName}
				disable3d={true}
			/>
		</div></button
	>

	<div class="invisible group-hover:visible flex text-xs pt-2 flex-col gap-y-1">
		<h5 class="text-muted-foreground flex items-center">
			Avg Price:
			<MoonStar class="h-4 text-foreground" />
			<span class="text-foreground">{formatCompactNumber(recentaverageprice, false)}</span>
		</h5>
		<h5 class="text-muted-foreground flex items-center">
			Orig Price:
			<MoonStar class="h-4 text-foreground" />
			<span class="text-foreground">{formatCompactNumber(originalprice, false)}</span>
		</h5>
		<h5 class="text-muted-foreground">
			Serial #
			<span class="text-foreground"
				>{#if serial !== 0}
					{serial} / {sold}
				{:else}
					-- / --
				{/if}</span
			>
		</h5>
	</div>
</div>
