<script lang="ts">
	import * as Tabs from '$src/components/ui/tabs'
	import * as Avatar from '$src/components/ui/avatar'
	import CatalogAvatar from '$src/components/catalog/avatar.svelte'
	import DownloadModal from '$src/components/downloadModal.svelte'
	import { Button } from '$src/components/ui/button'
	import { Upload, Cog } from 'lucide-svelte'
	import { launchStudio, launchStudioScript } from '$lib/develop/studio'
	import { getImage } from '$lib/games/getImage'

	import type { PageData } from './$types'

	export let data: PageData

	let downloadModal: DownloadModal

	import { pageName } from '$src/stores'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import { page } from '$app/stores'
	import { slugify } from '$lib/utils'

	pageName.set(data.t('generic.develop'))

	$: creations = data.creations
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<DownloadModal bind:this={downloadModal} type={'studio'} />

	<div class="flex gap-x-4 items-center">
		<h1 class="text-4xl leading-none tracking-tight font-semibold">{data.t('generic.develop')}</h1>

		<Button
			size="sm"
			variant="outline"
			on:click={() => {
				launchStudio(data.authBearer, downloadModal)
			}}>Open Studio</Button
		>
	</div>

	<Tabs.Root value={data.item} class="w-full flex flex-col gap-y-4">
		<Tabs.List class="w-full justify-around">
			<a href="/develop/games" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="games"
					>{data.t('generic.games')}</Tabs.Trigger
				></a
			>
			<a href="/develop/audio" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="audio"
					>{data.t('develop.audio')}</Tabs.Trigger
				></a
			>
			<a href="/develop/decals" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="decals"
					>{data.t('develop.decals')}</Tabs.Trigger
				></a
			>
			<a href="/develop/shirts" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="shirts"
					>{data.t('develop.shirts')}</Tabs.Trigger
				></a
			>
			<a href="/develop/pants" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="pants"
					>{data.t('develop.pants')}</Tabs.Trigger
				></a
			>
			<a href="/develop/t-shirts" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="t-shirts">T-Shirts</Tabs.Trigger
				></a
			>
			<a href="/develop/badges" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="badges">Badges</Tabs.Trigger></a
			>
			<a href="/develop/gamepasses" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="gamepasses"
					>Game Passes</Tabs.Trigger
				></a
			>
		</Tabs.List>
		<Tabs.Content value={data.item}>
			{#if data.item !== 'gamepasses' && data.item !== 'badges'}
				<a href="/develop/{data.item}/upload">
					<div
						class="h-40 supports-backdrop-blur:bg-background/60 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur p-4 select-none outline-dashed outline-muted-foreground/20 rounded-xl flex flex-col"
					>
						<Upload class="m-auto w-14 h-14" />
						<h1 class="mx-auto mb-auto font-semibold text-xl">{data.t('develop.uploadHere')}</h1>
					</div></a
				>
			{/if}
			{#if creations.length === 0}
				<EmptyCard class="p-8 m-auto" />
			{/if}
		</Tabs.Content>
	</Tabs.Root>
	{#if creations.length > 0}
		<div class="flex flex-col gap-y-4 mb-auto">
			{#each creations as creation}
				<div class="flex flex-row gap-x-2 w-full justify-center">
					<a
						href="/{creation.placeid ? 'games' : 'catalog'}/{creation.placeid ??
							creation.assetid}/{slugify(creation.assetName)}"
					>
						{#if data.params === 'shirts' || data.params === 'pants' || data.params === 't-shirts' || data.params === 'gamepasses' || data.params === 'badges'}
							<CatalogAvatar
								css="w-24 h-24 rounded-xl aspect-square"
								itemId={creation.assetid}
								itemName={creation.assetName}
								disable3d={true}
							/>
						{:else if data.params === 'games'}
							<Avatar.Root class="w-24 h-24 rounded-xl aspect-square">
								<Avatar.Image
									src={getImage(creation.iconUrl, creation.iconModerationState, 'icon')}
									alt={creation.assetName}
									loading="lazy"
								/>
								<Avatar.Fallback />
							</Avatar.Root>
						{:else}
							<Avatar.Root class="w-24 h-24 rounded-xl">
								<Avatar.Image
									src={creation.iconUrl
										? creation.iconUrl.toString()
										: '/Images/iconplaceholder.png'}
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
										><span class="text-muted-foreground">
											{#if creation.assetType === 'games'}
												{data.t('develop.totalVistors')}
											{:else}
												{data.t('develop.totalSales')}
											{/if}
										</span>
										{creation.totalStat}
									</td>
								</tr>
								<tr class="align-text-top">
									<td class="text-sm"
										><span class="text-muted-foreground">{data.t('assetGeneric.updated')}:</span>
										{creation.updated.toLocaleDateString('en-US')}</td
									>
									<td class="text-sm text-right"
										><span class="text-muted-foreground">{data.t('develop.last7Days')}</span>
										{creation.last7DaysStat}
									</td>
								</tr>
							</tbody>
						</table>
						<div class="flex m-auto gap-x-2">
							{#if data.params === 'games'}
								<Button
									size="sm"
									on:click={() => {
										launchStudioScript(
											creation.placeid ?? 0,
											data.authBearer,
											data.baseurl,
											downloadModal
										)
									}}>{data.t('develop.edit')}</Button
								>

								<Button
									size="icon"
									variant="outline"
									href="/develop/{data.item}/{creation.assetid}/edit"><Cog /></Button
								>
							{:else}
								<Button size="sm" href="/develop/{data.item}/{creation.assetid}/edit"
									>{data.t('develop.edit')}</Button
								>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
		<PaginationWrapper count={data.itemcount} size={28} url={$page.url} />
	{/if}
</div>
