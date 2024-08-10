<script lang="ts">
	import { pageName } from '$src/stores'
	import type { PageData } from './$types'

	import GameCard from '$src/components/games/gameCard.svelte'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import { page } from '$app/stores'

	export let data: PageData

	pageName.set(data.type)
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">{data.name}</h1>
	<div class="flex gap-4 mb-auto">
		{#each data.games as game}
			<GameCard
				gameId={game.places[0].placeid}
				gameName={game.gamename}
				playerCount={game.active}
				assetUrl={game.icon?.simpleasseturl}
				moderationState={game.icon?.moderationstate}
			/>
		{/each}
	</div>

	<PaginationWrapper count={data.gamesCount} size={40} url={$page.url} />
</div>
