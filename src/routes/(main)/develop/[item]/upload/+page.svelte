<script lang="ts">
	import type { PageData } from './$types'

	import GameFormPrimitive from '$src/components/develop/gameFormPrimitive.svelte'

	import ClothingFormPrimitive from '$src/components/develop/clothingFormPrimitive.svelte'

	import AssetFormPrimitive from '$src/components/develop/assetFormPrimitive.svelte'

	export let data: PageData
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Upload {data.friendlyName}</h1>

	{#if data.item === 'games'}
		<GameFormPrimitive
			fileTypes={data.fileTypes}
			data={data.gameForm}
			friendlyName={data.friendlyName}
		/>
	{:else if data.item === 'shirts' || data.item === 'pants'}
		<ClothingFormPrimitive
			fileTypes={data.fileTypes}
			data={data.clothingForm}
			friendlyName={data.friendlyName}
		/>
	{:else if data.item === 'audio' || data.item === 'decals' || data.item === 't-shirts' || data.item === 'badges' || data.item === 'gamepasses'}
		<AssetFormPrimitive
			fileTypes={data.fileTypes}
			data={data.assetForm}
			friendlyName={data.friendlyName}
		/>
	{/if}
</div>
