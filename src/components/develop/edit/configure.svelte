<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import * as DropdownMenu from '$src/components/ui/dropdown-menu'
	import DownloadModal from '$src/components/downloadModal.svelte'
	import ShutdownModal from '$src/components/games/shutdownModal.svelte'
	import { launchStudio } from '$lib/develop/studio'
	import { depluralize } from '$src/lib/utils'
	import { Menu } from 'lucide-svelte'

	let downloadModal: DownloadModal

	let shutdownModal: ShutdownModal

	export let itemid: number

	export let assetType: string

	export let itemName: string

	export let adminAsset: boolean

	export let authBearer: string | undefined = undefined

	export let baseurl: string | undefined = undefined

	export let placeid: number | undefined = undefined

	export let shutdownForm: HTMLFormElement | undefined = undefined

	export let canModerate: boolean
</script>

<DownloadModal bind:this={downloadModal} type={'studio'} />

{#if shutdownForm}
	<ShutdownModal bind:this={shutdownModal} {shutdownForm} />
{/if}

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder
		><Button builders={[builder]} variant="minimal" class="text-lg" size="icon">
			<Menu class="w-8 h-8 my-auto" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		{#if assetType === 'games'}
			<DropdownMenu.Item
				on:click={() => {
					launchStudio(placeid ?? 0, authBearer ?? '', baseurl ?? '', downloadModal)
				}}
				class="cursor-pointer">Edit</DropdownMenu.Item
			>
		{/if}
		<a href="/{adminAsset === false ? 'develop' : 'admin/catalog/upload'}/{assetType}/{itemid}/edit"
			><DropdownMenu.Item class="cursor-pointer"
				>Configure this {depluralize(itemName)}</DropdownMenu.Item
			></a
		>
		{#if canModerate}
			<a href="/admin/catalog/assetadmin/{placeid ?? itemid}"
				><DropdownMenu.Item class="cursor-pointer">Asset Admin</DropdownMenu.Item></a
			>
		{/if}

		{#if assetType === 'games'}
			<DropdownMenu.Item
				on:click={() => {
					shutdownModal.open()
				}}
				class="cursor-pointer"
				>Shut Down All Servers
			</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
