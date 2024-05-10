<script lang="ts">
	import type { AssetGenreDB } from '$lib/types'
	import {
		Box,
		Hammer,
		Building2,
		Ghost,
		Swords,
		Laugh,
		Castle,
		MapPinned,
		Satellite,
		Anchor,
		Sword,
		Crosshair,
		Medal,
		Axe,
		Gem
	} from 'lucide-svelte'

	export let genre: AssetGenreDB

	let icons = {
		All: Box,
		Building: Hammer,
		Horror: Ghost,
		'Town and City': Building2,
		Military: Swords,
		Comedy: Laugh,
		Medieval: Castle,
		Adventure: MapPinned,
		'Sci-Fi': Satellite,
		Naval: Anchor,
		FPS: Crosshair,
		RPG: Sword,
		Sports: Medal,
		Fighting: Axe,
		Western: Gem
	}
</script>

<div class="flex flex-col">
	<h1 class="text-sm flex items-center gap-x-1">
		<svelte:component this={icons[genre]} />
		{genre}
	</h1>
</div>
