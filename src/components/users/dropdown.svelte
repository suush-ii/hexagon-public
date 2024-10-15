<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import * as DropdownMenu from '$src/components/ui/dropdown-menu'
	import { Menu } from 'lucide-svelte'

	export let userid: number
</script>

<DropdownMenu.Root preventScroll={false}>
	<DropdownMenu.Trigger asChild let:builder
		><Button builders={[builder]} variant="minimal" class="text-lg ml-auto" size="icon">
			<Menu class="w-8 h-8 my-auto" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<a href="/trades/new/{userid}"
			><DropdownMenu.Item class="cursor-pointer">Trade Items</DropdownMenu.Item></a
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
