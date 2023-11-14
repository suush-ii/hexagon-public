<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-5xl leading-none tracking-tight font-semibold">{data.game.gamename}</h1>
</div>
