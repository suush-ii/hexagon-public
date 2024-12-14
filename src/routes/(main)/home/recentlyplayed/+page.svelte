<script lang="ts">
	import { pageName } from '$src/stores'
	import type { PageData } from './$types'
	import GameCard from '$src/components/games/gameCard.svelte'

	export let data: PageData

	pageName.set(data.t('home.recentlyPlayed'))
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">
		{data.t('home.recentlyPlayed')}
	</h1>

	<div class="flex flex-wrap gap-4 mb-auto">
		{#each data.recentlyPlayed as game}
			<GameCard
				gameId={game.place.placeid}
				gameName={game.place.placename}
				playerCount={game.active}
				assetUrl={game.icon?.simpleasseturl}
				moderationState={game.icon?.moderationstate}
			/>
		{/each}
	</div>
</div>
