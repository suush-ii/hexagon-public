<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import * as DropdownMenu from '$src/components/ui/dropdown-menu'
	import DownloadModal from '$src/components/downloadModal.svelte'
	import ShutdownModal from '$src/components/games/shutdownModal.svelte'
	import SellModalLimited from '$src/components/catalog/sell/sellModalLimited.svelte'
	import SellModalLimitedU from '$src/components/catalog/sell/sellModalLimitedU.svelte'
	import { launchStudioScript } from '$lib/develop/studio'
	import { depluralize } from '$src/lib/utils'
	import { Menu } from 'lucide-svelte'
	import type { Infer, SuperValidated } from 'sveltekit-superforms'
	import { type FormSchema as SellLimitedSchema } from '$lib/schemas/catalog/selllimitedschema'
	import { type FormSchema as SellLimitedSchemaU } from '$lib/schemas/catalog/selllimiteduschema'
	import type { clientVersions } from '$lib/types'

	let downloadModal: DownloadModal

	let shutdownModal: ShutdownModal

	let sellModalLimited: SellModalLimited

	let sellModalLimitedU: SellModalLimitedU

	export let itemid: number

	export let assetType: string

	export let itemName: string

	export let adminAsset: boolean

	export let authBearer: string | undefined = undefined

	export let baseurl: string | undefined = undefined

	export let placeid: number | undefined = undefined

	export let shutdownForm: HTMLFormElement | undefined = undefined

	export let originalForm: HTMLFormElement | undefined = undefined

	export let sellFormLimited: SuperValidated<Infer<SellLimitedSchema>> | undefined = undefined

	export let sellFormLimitedU: SuperValidated<Infer<SellLimitedSchemaU>> | undefined = undefined

	export let serials: { serialid: number | null }[] = []

	export let sold: number = 0

	export let canModerate: boolean

	export let canSell = false

	export let limited: string | undefined | null = undefined

	export let version: clientVersions | undefined | null = undefined
</script>

<DownloadModal bind:this={downloadModal} type={'studio'} />

{#if shutdownForm}
	<ShutdownModal bind:this={shutdownModal} {shutdownForm} />
{/if}

{#if sellFormLimited}
	<SellModalLimited bind:this={sellModalLimited} {sellFormLimited} {itemid} />
{/if}

{#if sellFormLimitedU}
	<SellModalLimitedU bind:this={sellModalLimitedU} {sellFormLimitedU} {itemid} {serials} {sold} />
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
					launchStudioScript(
						placeid ?? 0,
						authBearer ?? '',
						baseurl ?? '',
						downloadModal,
						'ide',
						0,
						version ?? '2014'
					)
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

			<a href="/develop/games/{itemid}/edit/gamepasses/upload"
				><DropdownMenu.Item class="cursor-pointer">Create a Game Pass</DropdownMenu.Item></a
			>

			<a href="/develop/games/{itemid}/edit/badges/upload"
				><DropdownMenu.Item class="cursor-pointer">Create a Badge for this Place</DropdownMenu.Item
				></a
			>
		{/if}

		<a href="/develop/{assetType}/{itemid}/edit/userads/upload"
			><DropdownMenu.Item class="cursor-pointer">Create an Ad</DropdownMenu.Item></a
		>

		{#if assetType === 'games' && canModerate}
			<DropdownMenu.Item
				on:click={() => {
					if (originalForm) {
						originalForm.submit()
					}
				}}
				class="cursor-pointer"
			>
				Toggle Original Game
			</DropdownMenu.Item>
		{/if}

		{#if canSell}
			<DropdownMenu.Item
				on:click={() => {
					if (limited === 'limitedu') {
						sellModalLimitedU.open()
					} else {
						sellModalLimited.open()
					}
				}}
				class="cursor-pointer">Sell Item</DropdownMenu.Item
			>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
