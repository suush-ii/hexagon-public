<script lang="ts">
	import SidePanel from '$src/components/admin/sidepanel.svelte'

	import * as Table from '$src/components/ui/table'

	import { pageName } from '$src/stores'

	import * as Pagination from '$src/components/ui/pagination'

	pageName.set('Admin')

	import type { PageData } from './$types'
	import { ChevronLeft, ChevronRight } from 'lucide-svelte'

	import { getText } from './index.js'
	import type { ActionTypes } from '$src/lib/server/admin'

	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { getPageNumber } from '$lib/utils'

	$: pageNumber = getPageNumber($page.url)

	function previousPage() {
		let query = new URLSearchParams($page.url.searchParams.toString())

		query.set('page', (pageNumber - 1).toString())

		goto(`?${query.toString()}`)
	}

	function nextPage() {
		let query = new URLSearchParams($page.url.searchParams.toString())

		query.set('page', (pageNumber + 1).toString())

		goto(`?${query.toString()}`)
	}

	function formatAction(
		action: ActionTypes,
		username: string,
		associatedid: number,
		assettype: string,
		assetname: string,
		gamename: string,
		banlength: string,
		newrole: string
	) {
		let text = getText(action).replace('{name}', username)

		if (
			action === 'warn' ||
			action === 'terminate' ||
			action === 'poison' ||
			action === 'unban' ||
			action === 'ban'
		) {
			return text.replace('{length}', banlength)
		}

		if (action === 'changedrole') {
			return text.replace('{role}', newrole)
		}

		if (action === 'shutdownjob' || action === 'shutdownalljobs') {
			return text.replace('{gamename}', gamename)
		}

		if (action === 'approvedasset' || action === 'rejectedasset' || action === 'moderatedasset') {
			return text
				.replace('{type}', assettype)
				.replace('{itemname}', assetname)
				.replace('{id}', associatedid.toString())
		}
	}

	export let data: PageData
</script>

<div class="p-4">
	<SidePanel role={data.user.role} />
</div>

<div class="p-8 flex flex-col space-y-4 grow mx-auto max-w-7xl">
	{#if data.logs}
		<div class="h-full flex flex-col justify-around py-4">
			<div class="mb-auto">
				<h1>Logs</h1>
				<Table.Root class="">
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[100px]">Admin</Table.Head>
							<Table.Head class="w-[100px]">UserID</Table.Head>
							<Table.Head>Action</Table.Head>
							<Table.Head class="text-right">Date</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.logs as log}
							<Table.Row>
								<Table.Cell>{log.admin.username}</Table.Cell>
								<Table.Cell>{log.userid}</Table.Cell>
								<Table.Cell
									><a
										target="_blank"
										class="hover:underline"
										href={log.associatedidtype === 'item'
											? '/catalog/' + log.associatedid
											: log.associatedidtype === 'game'
												? '/games/' + log.associatedid
												: log.associatedidtype === 'user'
													? `/users/${log.associatedid}/profile`
													: ''}
										>{formatAction(
											log.action,
											log.admin.username,
											log.associatedid,
											log?.asset?.assetType ?? '',
											log?.asset?.assetname ?? '',
											log?.game?.gamename ?? '',
											log.banlength ?? '',
											log.newrole ?? ''
										)}</a
									></Table.Cell
								>
								<Table.Cell class="text-right"
									>{log.time.toLocaleTimeString('en-US')}
									{log.time.toLocaleDateString('en-US')}</Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<Pagination.Root
				class="justify-self-end"
				count={data.logsCount[0].count}
				perPage={30}
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
		</div>
	{/if}
</div>
