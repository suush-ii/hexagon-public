<script lang="ts">
	import * as Tabs from '$src/components/ui/tabs/index.js'
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import * as Table from '$src/components/ui/table'
	import EditPlaceFormPrimitive from '$src/components/develop/edit/editPlaceFormPrimitive.svelte'
	import { Button } from '$src/components/ui/button'
	import { s3Url } from '$src/stores'
	import { slugify } from '$lib/utils'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import { writable, type Writable } from 'svelte/store'
	import Loader from '$src/components/develop/edit/game/loader.svelte'

	export let data: PageData

	$: versions = data.versions.map((version) => {
		return {
			...version,
			loading: writable(false)
		}
	})

	async function download(filename: string, hash: string, loading: Writable<boolean>) {
		loading.set(true)

		const data = await fetch(`https://${s3Url}/games/` + hash)

		if (data.status !== 200) {
			loading.set(false)
			return
		}

		const blob = await data.blob()

		const blobURL = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = blobURL
		a.style.display = 'none'

		if (filename && filename.length) a.download = filename
		document.body.appendChild(a)
		a.click()

		a.remove()

		setTimeout(() => {
			loading.set(false)
		}, 500)
	}
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">
		{data.t('develop.configure')} Place
	</h1>
	<Tabs.Root value={$page.url.searchParams.get('page') ?? 'settings'} class="h-full">
		<Tabs.List>
			<a href="?page=settings" class="w-full"
				><Tabs.Trigger value="settings" class="pointer-events-none">Settings</Tabs.Trigger></a
			>
			<a href="?page=versions" class="w-full"
				><Tabs.Trigger value="versions" class="pointer-events-none">Version History</Tabs.Trigger
				></a
			>
		</Tabs.List>
		<Tabs.Content value="settings">
			<EditPlaceFormPrimitive
				data={data.placeForm}
				friendlyName={data.friendlyName}
				name={data.assetname}
				geargenreenforced={data.geargenreenforced.toString()}
				gears={data.allowedgear}
			/>
		</Tabs.Content>
		<Tabs.Content value="versions" class="h-full">
			<Table.Root class="">
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-16">Version</Table.Head>
						<Table.Head class="w-3/4">Date</Table.Head>
						<Table.Head class="text-left w-[150px]"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each versions as version}
						<Table.Row>
							<Table.Cell>{version.rank}</Table.Cell>
							<Table.Cell>{version.time.toLocaleDateString('en-US')}</Table.Cell>
							<Table.Cell
								><Button
									size="sm"
									variant="outline"
									class="gap-x-6"
									on:click={() => {
										download(
											slugify(data.assetname) + '-' + version.rank + '.rbxl',
											version.filehash,
											version.loading
										)
									}}><Loader loading={version.loading} /> Download</Button
								></Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>

			<div class="mt-auto">
				<PaginationWrapper
					count={data.versionsCount}
					size={30}
					url={$page.url}
					queryName={'versionsPage'}
				/>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>
