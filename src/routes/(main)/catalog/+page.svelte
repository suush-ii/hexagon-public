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

	import { goto } from '$app/navigation'

	import { page } from '$app/stores'

	pageName.set('Catalog')

	let searchQuery = $page.url.searchParams.get('search')

	const categories = [
		{ value: 'all', label: 'All Categories' },
		{
			value: 'featured',
			label: 'Featured',
			types: [
				{ value: 'featured', label: 'All Featured Items' },
				{ value: 'featuredhats', label: 'Featured Hats' },
				{ value: 'featuredgear', label: 'Featured Gear' },
				{ value: 'featuredfaces', label: 'Featured Faces' },
				{ value: 'featuredpackages', label: 'Featured Packages' }
			]
		},
		{
			value: 'collectibles',
			label: 'Collectibles',
			types: [
				{ value: 'collectibles', label: 'All Collectibles' },
				{ value: 'collectibleface', label: 'Collectible Faces' },
				{ value: 'collectiblehats', label: 'Collectibles Hats' },
				{ value: 'collectiblegear', label: 'Collectibles Gear' }
			]
		},
		{
			value: 'clothing',
			label: 'Clothing',
			types: [
				{ value: 'clothing', label: 'All Clothing' },
				{ value: 'hats', label: 'Hats' },
				{ value: 'shirts', label: 'Shirts' },
				{ value: 'tshirts', label: 'T-Shirts' },
				{ value: 'pants', label: 'Pants' },
				{ value: 'packages', label: 'Packages' }
			]
		},
		{
			value: 'bodyparts',
			label: 'Body Parts',
			types: [
				{ value: 'bodyparts', label: 'All Body Parts' },
				{ value: 'heads', label: 'Heads' },
				{ value: 'faces', label: 'Faces' },
				{ value: 'packages', label: 'Packages' }
			]
		},
		{
			value: 'gear',
			label: 'Gear',
			types: [
				{ value: 'gear', label: 'All Gear' },
				{ value: 'meleeweapon', label: 'Melee Weapon' },
				{ value: 'rangedweapon', label: 'Ranged Weapon' },
				{ value: 'explosive', label: 'Explosive' },
				{ value: 'navigationenhancer', label: 'Navigation Enhancer' },
				{ value: 'musicalinstrument', label: 'Musical Instrument' },
				{ value: 'socialitem', label: 'Social Item' },
				{ value: 'buildingtool', label: 'Building Tool' },
				{ value: 'personaltransport', label: 'Personal Transport' }
			]
		}
	]

	let selected =
		categories.find((o) => o.value === $page.url.searchParams.get('category')) ?? categories[0]

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
		<h1 class="text-4xl leading-none tracking-tight font-semibold">Catalog</h1>

		<div class="flex flex-row flex-wrap md:flex-nowrap gap-x-2 grow">
			<Input bind:value={searchQuery} type="text" maxlength={128} class="w-full" icon={Search} />

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

			<Button size="sm" on:click={search}>Search</Button>
		</div>
	</div>

	<div class="flex flex-col md:flex-row h-full gap-x-4">
		<div
			class="flex flex-row flex-wrap md:flex-col h-fit bg-muted-foreground/5 rounded-xl w-64 relative"
		>
			<h1 class="text-base flex flex-row flex-wrap pb-4 bg-muted-foreground/10 p-4 rounded-xl">
				Browse by <div class="text-xl w-full flex flex-row justify-between">
					Category <ChevronDown />
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
						{#if category.value != 'gear'}
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
			<h1 class="text-4xl leading-none tracking-tight">Featured Items on Hexagon</h1>
			<div class="flex flex-row flex-wrap gap-4">
				{#each { length: 1 } as a}
					<CatalogCard itemName={'buh'} cost={200} itemId={1} />
				{/each}
			</div>
		</div>
	</div>
</div>
