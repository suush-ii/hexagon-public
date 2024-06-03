<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import * as DropdownMenu from '$src/components/ui/dropdown-menu'
	import { depluralize } from '$src/lib/utils'
	import { Menu } from 'lucide-svelte'

	export let itemid: number

	export let assetType: string

	export let itemName: string

	export let adminAsset: boolean
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder
		><Button builders={[builder]} variant="minimal" class="text-lg" size="icon">
			<Menu class="w-8 h-8 my-auto" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<a href="/{adminAsset === false ? 'develop' : 'admin/catalog/upload'}/{assetType}/{itemid}/edit"
			><DropdownMenu.Item class="cursor-pointer"
				>Configure this {depluralize(itemName)}</DropdownMenu.Item
			></a
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
