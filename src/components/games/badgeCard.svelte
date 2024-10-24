<script lang="ts">
	import Avatar from '$src/components/catalog/avatar.svelte'
	import { slugify } from '$lib/utils'

	export let assetid: number
	export let assetname: string
	export let description: string | null
	export let obtaineddate: unknown | Date

	export let wonyesterday: number
	export let wonever: number
	export let joinedGameCount: number
</script>

<div
	class="flex w-full group hover:outline-dashed outline-muted-foreground/20 outline-offset-8 gap-x-4 p-2"
>
	<a href="/catalog/{assetid}/{slugify(assetname)}">
		<Avatar
			css="w-24 h-24 2xl:w-32 2xl:h-32 rounded-xl aspect-square"
			itemId={assetid}
			itemName={assetname}
			disable3d={true}
		></Avatar>
	</a>

	<div class="flex flex-col">
		<a href="/catalog/{assetid}/{slugify(assetname)}">
			<h1 class="2xl:text-xl hover:underline font-semibold">
				{assetname}
			</h1></a
		>

		<h2 class="line-clamp-4 w-96 whitespace-normal">
			{description}
		</h2>

		{#if obtaineddate !== null && obtaineddate instanceof Date}
			<p class="text-sm text-muted-foreground mt-auto">
				Unlocked {obtaineddate.toLocaleString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					hour12: true
				})}
			</p>
		{/if}
	</div>

	<div class="flex ml-auto my-auto gap-x-6">
		<div class="flex flex-col gap-y-4 text-muted-foreground text-right">
			<h1>Rarity</h1>
			<h1>Won Yesterday</h1>
			<h1>Won Ever</h1>
		</div>

		<div class="flex flex-col gap-y-4 text-center">
			<h1>
				{Math.floor((wonyesterday / joinedGameCount === 0 ? wonyesterday : joinedGameCount) * 100)}%
			</h1>
			<h1>{wonyesterday}</h1>
			<h1>{wonever}</h1>
		</div>
	</div>
</div>
