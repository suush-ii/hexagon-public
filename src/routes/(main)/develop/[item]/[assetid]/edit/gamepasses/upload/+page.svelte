<script lang="ts">
	import type { PageData } from './$types'

	import GamePassFormPrimitive from '$src/components/develop/gamepassFormPrimitive.svelte'

	export let data: PageData
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Create a Game Pass</h1>

	<GamePassFormPrimitive
		fileTypes={data._uploadableAssets.gamepasses.fileTypes}
		data={data.gamepassForm}
		friendlyName={data._uploadableAssets.gamepasses.friendlyName}
	/>
</div>
