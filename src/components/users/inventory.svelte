<script lang="ts">
	import { page } from '$app/stores'
	import { Separator } from '$src/components/ui/separator'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import CatalogCard from '$src/components/catalog/catalogCard.svelte'
	import { goto } from '$app/navigation'

	import { categories } from '$lib/users/inventoryCategories'

	$: selected =
		categories.find((o) => o.value === $page.url.searchParams.get('category')) ?? categories[3]

	function search() {
		let query = new URLSearchParams($page.url.searchParams.toString())

		query.set('category', selected.value)

		goto(`?${query.toString()}`, { noScroll: true, keepFocus: true })
	}

	export let items: any

	export let itemsCount: number
</script>

<div class="flex gap-x-2 min-h-[85rem] h-full">
	<div class="flex flex-col w-full max-w-[14rem]">
		{#each categories as category}
			<button
				class="p-3 rounded-xl {category.value === selected.value
					? 'bg-muted-foreground/10'
					: 'hover:bg-muted-foreground/10'}"
				on:click={() => {
					selected = category
					search()
				}}
			>
				<h1 class="text-left px-4">{category.label}</h1>
			</button>
		{/each}
	</div>

	<Separator orientation="vertical" />

	<div class="flex flex-col gap-y-4 w-full p-2">
		<div class="flex flex-row flex-wrap gap-8 mb-auto">
			{#each items as item}
				<CatalogCard
					itemName={item.assetname}
					creator={item.author.username}
					creatorUserId={item.creatoruserid}
					cost={item.price}
					itemId={item.assetid}
					sales={item.sales}
					updated={item.updated}
					favorites={item.favorites}
					limited={item.limited}
					recentaverageprice={item.recentaverageprice}
				/>
			{/each}
		</div>

		<PaginationWrapper count={itemsCount} size={28} url={$page.url} queryName={'inventoryPage'} />
	</div>
</div>
