<script lang="ts">
	import { pageName } from '$src/stores'

	import { Input } from '$src/components/ui/input'
	import { Button } from '$src/components/ui/button'
	import * as Select from '$src/components/ui/select'
	import { Separator } from '$src/components/ui/separator'
	import { ChevronRight } from 'lucide-svelte'
	import { ChevronDown } from 'lucide-svelte'
	import { Search } from 'lucide-svelte'
	import CatalogCard from '$src/components/catalog/catalogCard.svelte'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import { categories } from './'

	import { goto } from '$app/navigation'

	import { page } from '$app/stores'

	import type { PageData } from './$types'

	export let data: PageData

	pageName.set(data.t('generic.catalog'))

	let searchQuery = $page.url.searchParams.get('search')

	let selected =
		categories.find((o) => o.value === $page.url.searchParams.get('category')) ??
		categories
			.map((category) => category.types)
			.flat()
			.find((product) => product?.value === $page.url.searchParams.get('category')) ??
		categories[0]

	function search() {
		let query = new URLSearchParams($page.url.searchParams.toString())

		query.set('category', selected.value)

		query.delete('search')
		if (searchQuery) {
			query.set('search', searchQuery)
		}

		goto(`?${query.toString()}`)
	}
</script>

<div class="container p-4 flex flex-col gap-y-6">
	<div class="flex flex-row justify-between gap-x-20 md:gap-x-96">
		<h1 class="text-4xl leading-none tracking-tight font-semibold">{data.t('generic.catalog')}</h1>

		<div class="flex flex-row flex-wrap md:flex-nowrap gap-x-2 grow">
			<Input
				bind:value={searchQuery}
				on:keyup={(event) => {
					if (event.key === 'Enter') {
						search()
					}
				}}
				type="text"
				maxlength={128}
				class="w-full"
				icon={Search}
			/>

			<Select.Root bind:selected>
				<Select.Trigger class="w-[300px]">
					<Select.Value />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each categories as category}
							<Select.Item value={category.value} label={category.label}
								>{category.label}</Select.Item
							>
						{/each}
					</Select.Group>
				</Select.Content>
				<Select.Input name="category" />
			</Select.Root>

			<Button size="sm" on:click={search}>{data.t('catalog.search')}</Button>
		</div>
	</div>

	<div class="flex flex-col md:flex-row h-full gap-x-4">
		<div
			class="flex flex-row flex-wrap md:flex-col h-fit bg-muted-foreground/5 rounded-xl w-64 relative"
		>
			<h1 class="text-base flex flex-row flex-wrap pb-4 bg-muted-foreground/10 p-4 rounded-xl">
				{data.t('catalog.browseBy')}
				<div class="text-xl w-full flex flex-row justify-between">
					{data.t('catalog.category')}
					<ChevronDown />
				</div>
			</h1>
			{#each categories as category}
				<div class="group">
					<Button
						variant="minimal"
						size="icon"
						class="w-full justify-between p-4 group-hover:bg-muted-foreground/10"
						on:click={() => {
							selected = category
							search()
						}}
						>{category.label}
						{#if category.value != 'all'}<ChevronRight />{/if}</Button
					>
					{#if category.value != 'all'}
						{#if category.value != 'gears'}
							<div
								class="absolute hidden group-hover:flex left-52 top-20 bg-background/80 w-full h-full z-40 p-2 rounded-xl flex-col flex-wrap max-h-72"
							>
								<h1 class="text-lg font-semibold w-full">{category.label} Types</h1>
								{#if category.types}
									{#each category.types as type}
										<Button
											variant="minimal"
											size="icon"
											class="w-full justify-between p-4 hover:bg-muted-foreground/10 text-base"
											on:click={() => {
												selected = type
												search()
											}}
											>{type.label}
										</Button>
									{/each}
								{/if}
							</div>
						{:else}
							<div
								class="absolute hidden group-hover:flex left-52 top-20 bg-background/80 h-full z-40 p-2 rounded-xl flex-row flex-wrap w-[25rem] max-h-72"
							>
								<h1 class="text-lg font-semibold w-full">{category.label} Types</h1>
								<div class="flex flex-col w-1/2">
									{#if category.types}
										{#each category.types.slice(0, 6) as type}
											<Button
												variant="minimal"
												size="icon"
												class="w-full justify-between p-4 hover:bg-muted-foreground/10 text-base"
												on:click={() => {
													selected = type
													search()
												}}
												>{type.label}
											</Button>
										{/each}
									{/if}
								</div>
								<div class="flex flex-col w-1/2">
									{#if category.types}
										{#each category.types.slice(6) as type}
											<Button
												variant="minimal"
												size="icon"
												class="w-full justify-between p-4 hover:bg-muted-foreground/10 text-base"
												on:click={() => {
													selected = type
													search()
												}}
												>{type.label}
											</Button>
										{/each}
									{/if}
								</div>
							</div>
						{/if}
					{/if}
				</div>
			{/each}
		</div>

		<Separator orientation="vertical" class="hidden md:block" />
		<Separator orientation="horizontal" class="block md:hidden" />

		<div class="flex flex-col gap-y-4 w-full">
			{#if data.items?.length !== 0}
				<h1 class="text-4xl leading-none tracking-tight">{data.t('catalog.featuredHero')}</h1>
				<div class="flex flex-row flex-wrap gap-8 mb-auto">
					{#if data.items}
						{#each data.items as item}
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
					{/if}
				</div>
				<PaginationWrapper count={data.itemscount} size={28} url={$page.url} />
			{:else}
				<EmptyCard />
			{/if}
		</div>
	</div>
</div>
