<script lang="ts">
	import GameTurnstile from '$src/components/games/gameTurnstile.svelte'
	import { Input } from '$src/components/ui/input'
	import * as Select from '$src/components/ui/select'
	import { assetGenreZod as genres } from '$lib'
	import { pageName } from '$src/stores'
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { Search } from 'lucide-svelte'
	import { browser } from '$app/environment'

	export let data: PageData

	pageName.set(data.t('generic.games'))

	$: selected = {
		label: 'All',
		value: 'All'
	}

	$: selected, search()

	let searchQuery = $page.url.searchParams.get('search')

	function search() {
		let query = new URLSearchParams($page.url.searchParams.toString())

		if (selected.value !== 'All') {
			query.set('genre', selected.value)
		}

		query.delete('search')
		if (searchQuery) {
			query.set('search', searchQuery)
		}

		if (browser && query.size > 0) {
			goto(`/games/search?${query.toString()}`)
		}
	}
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<div class="flex flex-row gap-x-8 flex-wrap md:flex-nowrap">
		<h1 class="text-4xl leading-none tracking-tight font-semibold">{data.t('generic.games')}</h1>

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
				class="w-fit ml-auto"
				icon={Search}
				direction="r"
			/>
		</div>
	</div>

	<h1 class="text-2xl leading-none tracking-tight font-semibold">Popular</h1>

	<GameTurnstile games={data.popular} type="popular" />

	<h1 class="text-2xl leading-none tracking-tight font-semibold">Original Games on Hexagon</h1>

	<GameTurnstile games={data.original} type="original" />

	<h1 class="text-2xl leading-none tracking-tight font-semibold">Top Rated</h1>

	<GameTurnstile games={data.topRated} type="toprated" />

	<h1 class="text-2xl leading-none tracking-tight font-semibold">Newest</h1>

	<GameTurnstile games={data.newest} type="newest" />
</div>
