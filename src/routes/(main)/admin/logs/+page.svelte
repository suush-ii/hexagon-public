<script lang="ts">
	import * as Table from '$src/components/ui/table'

	import { pageName } from '$src/stores'

	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	pageName.set('Admin')

	import type { PageData } from './$types'

	import { getText } from './index.js'
	import type { ActionTypes } from '$src/lib/server/admin'

	import { page } from '$app/stores'
	import { depluralize } from '$lib/utils'
	import * as Select from '$src/components/ui/select'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'

	function formatAction(
		action: ActionTypes,
		username: string,
		associatedid: number,
		assettype: string,
		assetname: string,
		gamename: string,
		banlength: string,
		newrole: string,
		itemid?: number,
		newid?: number,
		newname?: string
	) {
		let text = getText(action).replace('{name}', username)

		if (
			action === 'warn' ||
			action === 'terminate' ||
			action === 'poison' ||
			action === 'unban' ||
			action === 'ban'
		) {
			return text.replace('{length}', banlength.replace('Ban', ''))
		}

		if (action === 'changedrole') {
			return text.replace('{role}', newrole)
		}

		if (action === 'shutdownjob' || action === 'shutdownalljobs') {
			return text.replace('{gamename}', gamename)
		}

		if (
			action === 'approvedasset' ||
			action === 'rejectedasset' ||
			action === 'moderatedasset' ||
			action === 'uploadasset'
		) {
			return text
				.replace('{type}', depluralize(assettype.charAt(0).toUpperCase() + assettype.slice(1)))
				.replace('{itemname}', assetname)
				.replace('{id}', associatedid.toString())
		}

		if (action === 'moveitem') {
			return text
				.replace('{itemname}', assetname)
				.replace('{id}', associatedid.toString())
				.replace('{itemid}', itemid!.toString())
				.replace('{newid}', newid!.toString())
				.replace('{newname}', newname!)
		}

		if (action === 'deleteitem') {
			return text
				.replace('{itemname}', assetname)
				.replace('{itemid}', itemid!?.toString())
				.replace('{id}', associatedid.toString())
		}
	}

	$: selected = {
		value: 'all',
		label: 'All'
	}

	$: selectedAction = {
		value: 'all',
		label: 'All'
	}

	function changeUser() {
		let query = new URLSearchParams($page.url.searchParams.toString())
		if (browser) {
			query.set('user', selected.value)

			goto(`?${query.toString()}`)
		}
	}

	function changeAction() {
		let query = new URLSearchParams($page.url.searchParams.toString())
		if (browser) {
			query.set('action', selectedAction.value)

			goto(`?${query.toString()}`)
		}
	}

	$: selected, changeUser()

	$: selectedAction, changeAction()

	export let data: PageData
</script>

<div class="p-8 flex flex-col space-y-4 grow mx-auto max-w-7xl">
	{#if data.logs}
		<div class="h-full flex flex-col justify-around py-4">
			<div class="mb-auto space-y-2">
				<h1>Logs</h1>

				<div class="flex items-center gap-x-2">
					<h1>User:</h1>

					<Select.Root bind:selected>
						<Select.Trigger class="w-[300px]">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Item value="all" label="All">All</Select.Item>

								{#each data.users as user}
									<Select.Item value={user.userid} label={user.username}
										>{user.username}</Select.Item
									>
								{/each}
							</Select.Group>
						</Select.Content>
						<Select.Input name="category" />
					</Select.Root>

					<h1>Action:</h1>

					<Select.Root bind:selected={selectedAction}>
						<Select.Trigger class="w-[300px]">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Item value="all" label="All">All</Select.Item>

								{#each Object.entries(data.actionTypes) as [type, action]}
									<Select.Item value={type} label={action}>{action}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
						<Select.Input name="category" />
					</Select.Root>
				</div>
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
													: log.associatedidtype === 'move'
														? `/admin/users/inventory/${log?.movedinventoryitem}`
														: ''}
										>{formatAction(
											log.action,
											log?.user?.username ?? '',
											log.associatedid,
											log?.asset?.assetType ?? '',
											log?.movedItem?.assetname ??
												log?.deletedItem?.assetname ??
												log?.asset?.assetname ??
												'',
											log?.game?.places[0].placename ?? '',
											log.banlength ?? '',
											log.newrole ?? '',
											log?.movedItem?.assetid ?? log?.deletedItem?.assetid ?? 0,
											log?.movedToUser?.userid,
											log?.movedToUser?.username
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

			<PaginationWrapper count={data.logsCount[0].count} size={30} url={$page.url} />
		</div>
	{/if}
</div>
