<script lang="ts">
	import { depluralize } from '$lib/utils'
	import EditAssetFormPrimitive from '$src/components/develop/edit/editAssetFormPrimitive.svelte'
	import EditClothingFormPrimitive from '$src/components/develop/edit/editClothingFormPrimitive.svelte'
	import EditGameFormPrimitive from '$src/components/develop/edit/editGameFormPrimitive.svelte'
	import EditGameImageFormPrimitive from '$src/components/develop/edit/game/editGameImageFormPrimitive.svelte'
	import * as Tabs from '$src/components/ui/tabs/index.js'
	import type { PageData } from './$types'

	export let data: PageData

	$: itemName = data.item.charAt(0).toUpperCase() + data.item.slice(1)
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">
		Configure {depluralize(itemName)}
	</h1>

	{#if data.item === 'shirts' || data.item === 'pants'}
		<EditClothingFormPrimitive
			data={data.clothingForm}
			friendlyName={data.friendlyName}
			name={data.assetname}
			description={data.description}
			onsale={data.onsale}
			price={data.price}
			genres={data.genres}
		/>
	{:else if data.item === 'audio' || data.item === 'decals'}
		<EditAssetFormPrimitive
			data={data.assetForm}
			friendlyName={data.friendlyName}
			name={data.assetname}
			description={data.description}
			onsale={data.onsale}
			price={data.price}
			genres={data.genres}
		/>
	{:else if data.item === 'games'}
		<Tabs.Root value="settings">
			<Tabs.List>
				<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
				<Tabs.Trigger value="places">Places</Tabs.Trigger>
				<Tabs.Trigger value="icon">Icon</Tabs.Trigger>
				<Tabs.Trigger value="thumbnail">Thumbnail</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="settings"
				><EditGameFormPrimitive
					data={data.gameForm}
					friendlyName={data.friendlyName}
					name={data.assetname}
					description={data.description}
					genre={data.genres[0]}
					serversize={data.serversize}
				/></Tabs.Content
			>
			<Tabs.Content value="places">can't wait to do this :D</Tabs.Content>
			<Tabs.Content value="icon">
				<EditGameImageFormPrimitive
					data={data.gameImageForm}
					friendlyName={'Image'}
					fileTypes={data._uploadableAssets.decals.fileTypes}
					type={'icon'}
				/>
			</Tabs.Content>
			<Tabs.Content value="thumbnail">
				<EditGameImageFormPrimitive
					data={data.gameImageForm}
					friendlyName={'Image'}
					fileTypes={data._uploadableAssets.decals.fileTypes}
					type={'thumbnail'}
				/>
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>
