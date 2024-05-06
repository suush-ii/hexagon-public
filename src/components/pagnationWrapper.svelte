<script lang="ts">
	import { goto } from '$app/navigation'
	import * as Pagination from '$src/components/ui/pagination'
	import { getPageNumber } from '$src/lib/utils'
	import { ChevronLeft, ChevronRight } from 'lucide-svelte'

	export let count: number

	$: if (count === 0) {
		count = 1
	}

	export let url: URL

	export let queryName = 'page'

	$: pageNumber = getPageNumber(url)

	export let size: number

	function previousPage() {
		let query = new URLSearchParams(url.searchParams.toString())

		query.set(queryName, (pageNumber - 1).toString())

		goto(`?${query.toString()}`)
	}

	function nextPage() {
		let query = new URLSearchParams(url.searchParams.toString())

		query.set(queryName, (pageNumber + 1).toString())

		goto(`?${query.toString()}`)
	}
</script>

<Pagination.Root
	class="justify-self-end"
	{count}
	perPage={size}
	siblingCount={1}
	let:pages
	let:currentPage
>
	<Pagination.Content>
		<Pagination.Item>
			<Pagination.PrevButton on:click={previousPage}>
				<ChevronLeft class="h-4 w-4" />
				<span class="hidden sm:block">Previous</span>
			</Pagination.PrevButton>
		</Pagination.Item>
		{#each pages as page (page.key)}
			{#if page.type === 'ellipsis'}
				<Pagination.Item>
					<Pagination.Ellipsis />
				</Pagination.Item>
			{:else}
				<Pagination.Item>
					<Pagination.Link {page} isActive={currentPage === page.value}>
						{page.value}
					</Pagination.Link>
				</Pagination.Item>
			{/if}
		{/each}
		<Pagination.Item>
			<Pagination.NextButton on:click={nextPage}>
				<span class="hidden sm:block">Next</span>
				<ChevronRight class="h-4 w-4" />
			</Pagination.NextButton>
		</Pagination.Item>
	</Pagination.Content>
</Pagination.Root>
