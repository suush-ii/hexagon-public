<script lang="ts">
	import GameTurnstile from '$src/components/games/gameTurnstile.svelte'

	import { pageName } from '$src/stores'
	import type { PageData } from './$types'
	pageName.set('Games')

	export let data: PageData
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-5xl leading-none tracking-tight font-semibold">Games</h1>

	<h1 class="text-2xl leading-none tracking-tight font-semibold">Popular</h1>

	<GameTurnstile games={data.popular} />
</div>
