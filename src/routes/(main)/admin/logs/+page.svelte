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
	}

	export let data: PageData
</script>

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

			<PaginationWrapper count={data.logsCount[0].count} size={30} url={$page.url} />
		</div>
	{/if}
</div>
