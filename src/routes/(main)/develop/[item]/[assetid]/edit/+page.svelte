<script lang="ts">
	import { depluralize } from '$lib/utils'
	import EditAssetFormPrimitive from '$src/components/develop/edit/editAssetFormPrimitive.svelte'
	import EditClothingFormPrimitive from '$src/components/develop/edit/editClothingFormPrimitive.svelte'
	import EditGameFormPrimitive from '$src/components/develop/edit/editGameFormPrimitive.svelte'
	import EditGameImageFormPrimitive from '$src/components/develop/edit/game/editGameImageFormPrimitive.svelte'
	import EditBadgeFormPrimitive from '$src/components/develop/edit/editBadgeFormPrimitive.svelte'
	import EditGamepassFormPrimitive from '$src/components/develop/edit/editGamepassFormPrimitive.svelte'
	import GameThumbnail from '$src/components/games/gameThumbnail.svelte'
	import * as Tabs from '$src/components/ui/tabs/index.js'
	import { Button } from '$src/components/ui/button'
	import Separator from '$src/components/ui/separator/separator.svelte'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import type { PageData } from './$types'
	import { page } from '$app/stores'

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
	{:else if data.item === 'audio' || data.item === 'decals' || data.item === 't-shirts' || data.item === 'models'}
		<EditAssetFormPrimitive
			data={data.assetForm}
			friendlyName={data.friendlyName}
			name={data.assetname}
			description={data.description}
			onsale={data.onsale}
			price={data.price}
			genres={data.genres}
		/>
	{:else if data.item === 'badges'}
		<EditBadgeFormPrimitive
			data={data.badgeForm}
			friendlyName={data.friendlyName}
			name={data.assetname}
			description={data.description}
		/>
	{:else if data.item === 'gamepasses'}
		<EditGamepassFormPrimitive
			data={data.gamepassForm}
			friendlyName={data.friendlyName}
			name={data.assetname}
			description={data.description}
			onsale={data.onsale}
			price={data.price}
		/>
	{:else if data.item === 'games'}
		<Tabs.Root value={$page.url.searchParams.get('page') ?? 'settings'}>
			<Tabs.List class="!rounded-b-none rounded-t-xl">
				<a href="?page=settings" class="w-full"
					><Tabs.Trigger value="settings" class="pointer-events-none !rounded-b-none rounded-t-xl"
						>{data.t('generic.settings')}</Tabs.Trigger
					></a
				>
				<a href="?page=places" class="w-full"
					><Tabs.Trigger value="places" class="pointer-events-none !rounded-b-none rounded-t-xl"
						>{data.t('develop.places')}</Tabs.Trigger
					></a
				>
				<a href="?page=icon" class="w-full"
					><Tabs.Trigger value="icon" class="pointer-events-none !rounded-b-none rounded-t-xl"
						>{data.t('develop.icon')}</Tabs.Trigger
					>
				</a>
				<a href="?page=thumbnail" class="w-full"
					><Tabs.Trigger value="thumbnail" class="pointer-events-none !rounded-b-none rounded-t-xl"
						>{data.t('develop.thumbnail')}</Tabs.Trigger
					></a
				>
			</Tabs.List>
			<Tabs.Content value="settings"
				><EditGameFormPrimitive
					data={data.gameForm}
					friendlyName={data.friendlyName}
					name={data.assetname}
					description={data.description}
					genre={data.genres[0]}
					serversize={data.serversize}
					clientversion={data.clientversion}
				/></Tabs.Content
			>
			<Tabs.Content value="places">
				<div class="flex flex-col space-y-8">
					{#each data.places as place}
						{#if place.startplace}
							<div class="space-y-4">
								<h1>Start Place</h1>
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
							</div>
						{/if}
					{/each}
					<Separator />

					<div class="space-y-4">
						<h1>Other Places</h1>

						<a href="/develop/games/{data.assetid}/edit/places/upload"
							><Button size="sm">Add Place</Button></a
						>

						<div
							class="outline-dashed outline-muted-foreground/20 rounded-xl p-4 flex flex-col gap-y-8"
						>
							{#if data.places.length <= 1}
								<EmptyCard hideDefault={true}>
									<h5 class="text-center">You can always add places to your game.</h5>
								</EmptyCard>
							{:else}
								{#each data.places as place}
									{#if place.startplace === false}
										<div class="flex gap-x-4 items-center max-w-2xl">
											<GameThumbnail
												assetUrl={place.associatedgame.thumbnail?.simpleasseturl}
												moderationState={place.associatedgame.thumbnail?.moderationstate}
												gamename={place.placename}
												size="xl:h-[120px] h-fit w-fit"
											/>

											<a href="/develop/games/{data.assetid}/edit/places/{place.placeid}"
												><h1 class="line-clamp-2 w-full max-w-xl hover:underline">
													{place.placename}
												</h1></a
											>
										</div>
									{/if}
								{/each}
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
