<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	import { pageName } from '$src/stores'
	import { Input } from '$src/components/ui/input'
	import { page } from '$app/stores'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { Button } from '$src/components/ui/button'
	import { Search } from 'lucide-svelte'
	import * as Table from '$src/components/ui/table'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import Avatar from '$src/components/users/avatar.svelte'
	import Dot from '$src/components/people/dot.svelte'

	pageName.set(data.t('generic.people'))

	let searchQuery = $page.url.searchParams.get('search') ?? ''

	function search() {
		let query = new URLSearchParams($page.url.searchParams.toString())

		query.delete('search')
		if (searchQuery) {
			query.set('search', searchQuery)
		}

		if (browser && query.size > 0) {
			goto(`?${query.toString()}`)
		}
	}
</script>

<div class="container p-8 flex flex-col gap-y-4">
	<div class="flex flex-row flex-wrap md:flex-nowrap gap-x-4 items-center">
		<h5>{data.t('catalog.search')}:</h5>

		<Input
			bind:value={searchQuery}
			on:keyup={(event) => {
				if (event.key === 'Enter') {
					search()
				}
			}}
			type="text"
			maxlength={128}
			class="w-full"
			icon={Search}
		/>

		<Button size="sm" on:click={search}>{data.t('catalog.search')}</Button>
	</div>

	<Table.Root class="">
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">{data.t('generic.avatar')}</Table.Head>
				<Table.Head class="w-[150px]">{data.t('people.name')}</Table.Head>
				<Table.Head>{data.t('people.blurb')}</Table.Head>
				<Table.Head class="text-left w-[150px]">{data.t('people.lastSeen')}</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if data.users}
				{#each data.users as user}
					<Table.Row class="items-center h-full">
						<Table.Cell class=""
							><a href="/users/{user.userid}/profile">
								{#key user}
									<Avatar
										state={'offline'}
										userid={user.userid}
										css="w-[68px] h-[68px]"
										type="avatar"
										disableoutline={true}
										disable3d={true}
									/>
								{/key}
							</a>
						</Table.Cell>
						<Table.Cell
							class="flex gap-x-2 items-center truncate w-[150px] hover:underline text-base h-24"
						>
							<Dot state={user.status} />
							<a href="/users/{user.userid}/profile"
								><h2 class="w-[120px] truncate h-full">{user.username}</h2></a
							>
						</Table.Cell>
						<Table.Cell class="items-center truncate w-full text-base h-full">
							<h2 class="h-full whitespace-pre-line line-clamp-[12]">{user.blurb}</h2>
						</Table.Cell>
						<Table.Cell class="items-center truncate text-base">
							<h2>
								{user.lastactivetime.toLocaleDateString('en-US')}
							</h2>
							<h2>
								{user.lastactivetime.toLocaleTimeString('en-US', {
									hour: 'numeric',
									minute: '2-digit'
								})}
							</h2>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>

	<div class="mt-auto">
		<PaginationWrapper count={data.usersCount ?? 0} size={10} url={$page.url} />
	</div>
</div>
