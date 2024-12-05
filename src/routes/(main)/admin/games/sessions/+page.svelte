<script lang="ts">
	import * as Table from '$src/components/ui/table'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import { page } from '$app/stores'

	import type { PageData } from './$types'

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
							<Table.Head>JobID</Table.Head>
							<Table.Head class="w-[100px]">UserID</Table.Head>
							<Table.Head class="w-[100px]">Verified</Table.Head>
							<Table.Head>Flagged</Table.Head>
							<Table.Head>PlaceID</Table.Head>
							<Table.Head class="text-right">Created</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.logs as log}
							<Table.Row>
								<a href="/admin/games/logs/{log.jobid}" class="hover:underline"><Table.Cell>{log.jobid}</Table.Cell></a>
								<Table.Cell>{log.userid}</Table.Cell>
								<Table.Cell>{log.verified}</Table.Cell>
								<Table.Cell>{log.flagged}</Table.Cell>
								<Table.Cell>{log.placeid}</Table.Cell>
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
