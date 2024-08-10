<script lang="ts">
	import { depluralize } from '$lib/utils'
	import EditAssetFormPrimitive from '$src/components/develop/edit/editAssetFormPrimitive.svelte'
	import EditClothingFormPrimitive from '$src/components/develop/edit/editClothingFormPrimitive.svelte'
	import EditGameFormPrimitive from '$src/components/develop/edit/editGameFormPrimitive.svelte'
	import EditGameImageFormPrimitive from '$src/components/develop/edit/game/editGameImageFormPrimitive.svelte'
	import GameThumbnail from '$src/components/games/gameThumbnail.svelte'
	import * as Tabs from '$src/components/ui/tabs/index.js'
	import { Button } from '$src/components/ui/button'
	import Separator from '$src/components/ui/separator/separator.svelte'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { getImage } from '$lib/games/getImage'

	export let data: PageData

	$: itemName = data.item.charAt(0).toUpperCase() + data.item.slice(1)
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">
		{data.t('develop.configure')}
		{depluralize(itemName)}
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
	{:else if data.item === 'audio' || data.item === 'decals' || data.item === 't-shirts'}
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
		<Tabs.Root
			value={$page.url.searchParams.get('page') ?? 'settings'}
			on:onValueChange={() => {
				console.log('eee')
			}}
		>
			<Tabs.List>
				<Tabs.Trigger value="settings">{data.t('generic.settings')}</Tabs.Trigger>
				<Tabs.Trigger value="places">{data.t('develop.places')}</Tabs.Trigger>
				<Tabs.Trigger value="icon">{data.t('develop.icon')}</Tabs.Trigger>
				<Tabs.Trigger value="thumbnail">{data.t('develop.thumbnail')}</Tabs.Trigger>
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
			<Tabs.Content value="places">
				<div class="flex flex-col space-y-8">
					{#each data.places as place}
						<div class="space-y-4">
							<h1>Start Place</h1>

							{#if place.startplace}
								<div class="flex gap-x-4 items-center max-w-2xl">
									<GameThumbnail
										assetUrl={place.associatedgame.thumbnail?.simpleasseturl}
										moderationState={place.associatedgame.thumbnail?.moderationstate}
										gamename={data.assetname}
										size="xl:h-[120px] h-fit w-fit"
									/>

									<a href="/develop/games/{data.assetid}/edit/places/{place.placeid}"
										><h1 class="line-clamp-2 w-full max-w-xl hover:underline">
											{data.assetname}
										</h1></a
									>
								</div>
							{/if}
						</div>
					{/each}
					<Separator />

					<div class="space-y-4">
						<h1>Other Places</h1>

						<a href="/develop/games/{data.assetid}/edit/places/upload"
							><Button size="sm">Add Place</Button></a
						>

						<div class="outline-dashed outline-muted-foreground/20 rounded-xl p-4">
							{#if data.places.length <= 1}
								<EmptyCard hideDefault={true}>
									<h5 class="text-center">You can always add places to your game.</h5>
								</EmptyCard>
							{/if}
						</div>
					</div>
				</div>
			</Tabs.Content>
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
