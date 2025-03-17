<script lang="ts">
	import * as Select from '$src/components/ui/select'
	import { Checkbox } from '$src/components/ui/checkbox'
	import type { PageData } from './$types'

	$: selected = {
		value: 'all',
		label: 'All'
	}

	export let data: PageData

	let checked = false

	function removeNormalizedDuplicates(logText: string, keepChats = true) {
		const lines = logText.split('\n')
		const actionCounts = new Map()

		for (const line of lines) {
			if (line.startsWith('[INSTANCE]')) {
				const parts = line.split(' ')
				if (parts.length >= 3) {
					const username = parts[1]

					const fullContent = parts.slice(2).join(' ')

					let normalizedAction
					const parentIndex = fullContent.indexOf(' Parent:')
					if (parentIndex !== -1) {
						normalizedAction = fullContent.substring(0, parentIndex)
					} else {
						normalizedAction = fullContent
					}

					actionCounts.set(normalizedAction, (actionCounts.get(normalizedAction) || 0) + 1)
				}
			}
		}

		const filteredLines = lines.filter((line) => {
			if (line.startsWith('[CHAT]')) {
				return keepChats
			}

			if (line.startsWith('[INSTANCE]')) {
				const parts = line.split(' ')
				if (parts.length >= 3) {
					const username = parts[1]
					const fullContent = parts.slice(2).join(' ')

					let normalizedAction
					const parentIndex = fullContent.indexOf(' Parent:')
					if (parentIndex !== -1) {
						normalizedAction = fullContent.substring(0, parentIndex)
					} else {
						normalizedAction = fullContent
					}

					return actionCounts.get(normalizedAction) === 1
				}
			}

			return true
		})

		return filteredLines.join('\n')
	}

	$: filtered = removeNormalizedDuplicates(data.logs.map((log) => log.log).join('\n'), false)
</script>

<div class="p-8 flex flex-col space-y-4 grow mx-auto max-w-7xl">
	<div class="flex items-center gap-x-2">
		<h1>User:</h1>

		<Select.Root bind:selected>
			<Select.Trigger class="w-[300px]">
				<Select.Value />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Item value="all" label="All">All</Select.Item>

					{#each data.logs as log}
						<Select.Item value={log.userid} label={log.user.username}
							>{log.user.username}</Select.Item
						>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="category" />
		</Select.Root>

		<label for="terms">Filter Duplicates</label>

		<Checkbox id="terms" bind:checked />
	</div>

	<div class="bg-muted-foreground/10 p-4 rounded-xl">
		{#if checked}
			{#each filtered.split('\n') as line}
				<h1 class="whitespace-pre-line">{line}</h1>
			{/each}
		{:else}
			{#each data.logs as log}
				{#if selected.value === 'all' || Number(selected.value) === log.userid}
					<h1 class="whitespace-pre-line">{log.log}</h1>
				{/if}
			{/each}
		{/if}
	</div>
</div>
