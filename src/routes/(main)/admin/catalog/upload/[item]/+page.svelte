<script lang="ts">
	import * as Tabs from '$src/components/ui/tabs'
	import { Upload } from 'lucide-svelte'
	import { adminAssets } from '.'

	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="p-8 flex flex-col space-y-4 grow">
	<Tabs.Root value={data.item} class="w-full flex flex-col gap-y-4">
		<Tabs.List class="w-full justify-around">
			<a href="/admin/catalog/upload/hats" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="hats">Hats</Tabs.Trigger></a
			>
			<a href="/admin/catalog/upload/gears" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="gears">Gears</Tabs.Trigger></a
			>
			<a href="/admin/catalog/upload/faces" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="faces">Faces</Tabs.Trigger></a
			>
			<a href="/admin/catalog/upload/packages" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="packages">Packages</Tabs.Trigger
				></a
			>
			<a href="/admin/catalog/upload/heads" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="heads">Heads</Tabs.Trigger></a
			>
			<a href="/admin/catalog/upload/meshes" class="w-full"
				><Tabs.Trigger class="w-full pointer-events-none" value="meshes">Meshes</Tabs.Trigger></a
			>
		</Tabs.List>
		<Tabs.Content value={data.item}>
			<a href="/admin/catalog/upload/{data.item}/upload">
				<div
					class="h-40 supports-backdrop-blur:bg-background/60 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur p-4 select-none outline-dashed outline-muted-foreground/20 rounded-xl flex flex-col"
				>
					<Upload class="m-auto w-14 h-14" />
					<h1 class="mx-auto mb-auto font-semibold text-xl">Upload Here</h1>
				</div></a
			>
		</Tabs.Content>
	</Tabs.Root>
</div>
