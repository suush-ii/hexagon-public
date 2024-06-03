<script lang="ts">
	import * as Tabs from '$src/components/ui/tabs'
	import * as Avatar from '$src/components/ui/avatar'
	import CatalogAvatar from '$src/components/catalog/avatar.svelte'
	import { Button } from '$src/components/ui/button'
	import { Upload } from 'lucide-svelte'

	import type { PageData } from './$types'

	export let data: PageData

	import { pageName } from '$src/stores'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import { page } from '$app/stores'
	import { slugify } from '$lib/utils'

	pageName.set('Develop')

	$: creations = data.creations
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Develop</h1>

	<Tabs.Root value={data.item} class="w-full flex flex-col gap-y-4">
		<Tabs.List class="w-full justify-around">
			<a href="/develop/games" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="games">Games</Tabs.Trigger></a
			>
			<a href="/develop/audio" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="audio">Audio</Tabs.Trigger></a
			>
			<a href="/develop/decals" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="decals">Decals</Tabs.Trigger></a
			>
			<a href="/develop/shirts" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="shirts">Shirts</Tabs.Trigger></a
			>
			<a href="/develop/pants" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="pants">Pants</Tabs.Trigger></a
			>
		</Tabs.List>
		<Tabs.Content value={data.item}>
			<a href="/develop/{data.item}/upload">
				<div
					class="h-40 supports-backdrop-blur:bg-background/60 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur p-4 select-none outline-dashed outline-muted-foreground/20 rounded-xl flex flex-col"
				>
					<Upload class="m-auto w-14 h-14" />
					<h1 class="mx-auto mb-auto font-semibold text-xl">Upload Here</h1>
				</div></a
			>
			{#if creations.length === 0}
				<EmptyCard class="p-8 m-auto" />
			{/if}
		</Tabs.Content>
	</Tabs.Root>
	{#if creations.length > 0}
		<div class="flex flex-col gap-y-4 mb-auto">
			{#each creations as creation}
				<div class="flex flex-row gap-x-2 w-full justify-center">
					<a href="/catalog/{creation.assetid}/{slugify(creation.assetName)}">
						{#if data.params === 'shirts' || data.params === 'pants'}
							<CatalogAvatar
								css="w-24 h-24 rounded-xl aspect-square"
								itemId={creation.assetid}
								itemName={creation.assetName}
								disable3d={true}
							/>
						{:else if data.params === 'games' && creation.iconId}
							<CatalogAvatar
								css="w-24 h-24 rounded-xl aspect-square"
								itemId={creation.iconId}
								itemName={creation.assetName}
								disable3d={true}
							/>
						{:else}
							<Avatar.Root class="w-24 h-24 rounded-xl">
								<Avatar.Image
									src={creation.iconUrl ? creation.iconUrl : '/Images/iconplaceholder.png'}
									alt={creation.assetName}
									loading="lazy"
								/>
								<Avatar.Fallback />
							</Avatar.Root>
						{/if}</a
					>

					<div class="flex flex-row gap-x-4 w-full max-w-6xl">
						<table class="table-auto w-full">
							<tbody>
								<tr>
									<td class="text-xl"><h1 class="truncate">{creation.assetName}</h1></td>
									<td class="text-sm text-right"
										><span class="text-muted-foreground"
											>Total
											{#if creation.assetType === 'games'}
												Visitors:
											{:else}
												Sales:
											{/if}
										</span>
										{creation.totalStat}
									</td>
								</tr>
								<tr class="align-text-top">
									<td class="text-sm"
										><span class="text-muted-foreground">Updated:</span>
										{creation.updated.toLocaleDateString('en-US')}</td
									>
									<td class="text-sm text-right"
										><span class="text-muted-foreground">Last 7 days:</span>
										{creation.last7DaysStat}
									</td>
								</tr>
							</tbody>
						</table>
						<div class="flex m-auto">
							<Button href="/develop/{data.item}/{creation.assetid}/edit">Edit</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<PaginationWrapper count={data.itemcount} size={28} url={$page.url} />
	{/if}
</div>
