<script lang="ts">
	import * as Tabs from '$src/components/ui/tabs'
	import * as Avatar from '$src/components/ui/avatar'
	import { Upload } from 'lucide-svelte'

	import type { PageData } from './$types'

	export let data: PageData

	import { pageName } from '$src/stores'
	import EmptyCard from '$src/components/emptyCard.svelte'

	pageName.set('Develop')
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
			{#if data.creations.length === 0}
				<EmptyCard class="p-8 m-auto" />
			{/if}
		</Tabs.Content>
	</Tabs.Root>
	{#if data.creations.length > 0}
		<div class="flex flex-col gap-y-4">
			{#each data.creations as creation}
				<div class="flex flex-row gap-x-2">
					<Avatar.Root class="w-24 h-24 rounded-xl">
						<Avatar.Image
							src={creation.iconUrl ? creation.iconUrl : '/Images/iconplaceholder.png'}
							alt={creation.assetName}
							loading="lazy"
						/>
						<Avatar.Fallback />
					</Avatar.Root>

					<div>
						<h1 class="text-xl">{creation.assetName}</h1>

						<div class="flex flex-row space-x-2">
							<p class="text-sm text-muted-foreground flex">Updated:</p>
							<p class="text-sm">{creation.updated}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
