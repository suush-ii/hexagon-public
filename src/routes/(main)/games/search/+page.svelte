<script lang="ts">
	import { Input } from '$src/components/ui/input'
	import * as Select from '$src/components/ui/select'
	import { assetGenreZod as genres } from '$lib'
	import { pageName } from '$src/stores'
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { Search } from 'lucide-svelte'
	import { browser } from '$app/environment'
	import { Button } from '$src/components/ui/button'
	import GameCard from '$src/components/games/gameCard.svelte'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	export let data: PageData

	pageName.set(data.t('generic.games'))

	let searchQuery = $page.url.searchParams.get('search') ?? ''

	let genre = $page.url.searchParams.get('genre') ?? 'All'

	$: selected = {
		label: genre,
		value: genre
	}

	$: selected, search()

	function search() {
		let query = new URLSearchParams($page.url.searchParams.toString())

		query.delete('genre')

		if (selected.value !== 'All') {
			query.set('genre', selected.value)
		}

		query.delete('search')
		if (searchQuery) {
			query.set('search', searchQuery)
		}

		if (browser && query.size > 0) {
			goto(`?${query.toString()}`)
		}
	}
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<div class="flex flex-row gap-x-8 flex-wrap md:flex-nowrap">
		<h1 class="text-4xl leading-none tracking-tight font-semibold">Search Results</h1>

		<div class="flex flex-row flex-wrap md:flex-nowrap gap-x-2 grow items-center">
			<h5>{data.t('games.genre')}:</h5>
			<Select.Root bind:selected>
				<Select.Trigger class="w-[200px]">
					<Select.Value />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each genres as genre}
							<Select.Item value={genre} label={genre}>{genre}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
				<Select.Input name="genre" />
			</Select.Root>

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

			<Button size="sm" on:click={search}>{data.t('catalog.search')}</Button>
		</div>
	</div>

	<div class="flex flex-wrap gap-4 mb-auto">
		{#each data.games as game}
			<GameCard
				gameId={game?.places.placeid}
				gameName={game?.places.placename}
				playerCount={game.active}
				assetUrl={game.icon?.simpleasseturl}
				moderationState={game.icon?.moderationstate}
			/>
		{/each}
	</div>

	<PaginationWrapper count={data.gamesCount} size={40} url={$page.url} />
</div>
