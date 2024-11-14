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
				gameId={game.game.places[0].placeid}
				gameName={game.game.places[0].placename}
				playerCount={game.game.active}
				assetUrl={game.game.icon?.simpleasseturl}
				moderationState={game.game.icon?.moderationstate}
			/>
		{/each}
	</div>
</div>
