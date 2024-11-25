<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import * as DropdownMenu from '$src/components/ui/dropdown-menu'
	import Avatar from '$src/components/catalog/avatar.svelte'
	import * as Pagination from '$src/components/ui/pagination'
	import { slugify } from '$lib/utils'

	export let items: any[] = []

	let page = 1

	$: itemsPaged = items.slice((page - 1) * 6, page * 6)
</script>

<DropdownMenu.Root preventScroll={false}>
	<DropdownMenu.Trigger asChild let:builder
		><Button builders={[builder]} variant="outline" size="sm">View Items</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="p-2">
		<div class="p-8 flex flex-wrap gap-4 w-96 h-72">
			{#each itemsPaged as item}
				<a href="/catalog/{item.itemid}/{slugify(item.asset.assetname)}">
					<Avatar
						css="w-24 h-24 rounded-xl aspect-square"
						itemId={item.itemid}
						itemName={item.asset.assetname}
						disable3d={true}
					>
						{#if item.asset.limited}
							<div class="h-7 absolute left-0 bottom-0">
								<img
									class="w-full h-full"
									src="/Images/{item.asset.limited}.svg"
									alt={item.asset.limited}
								/>
							</div>{/if}
					</Avatar>
				</a>
			{/each}
		</div>

		<Pagination.Root count={items.length} perPage={6} let:pages let:currentPage bind:page>
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton />
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link {page} isActive={currentPage == page.value}>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton />
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	</DropdownMenu.Content>
</DropdownMenu.Root>
