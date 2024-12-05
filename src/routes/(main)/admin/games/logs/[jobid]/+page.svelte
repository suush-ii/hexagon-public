<script lang="ts">
	import * as Select from '$src/components/ui/select'
	import type { PageData } from './$types'

	$: selected = {
		value: 'all',
		label: 'All'
	}

	export let data: PageData
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
	</div>

	<div class="bg-muted-foreground/10 p-4 rounded-xl">
		{#each data.logs as log}
			{#if selected.value === 'all' || Number(selected.value) === log.userid}
				<h1 class="whitespace-pre-line">{log.log}</h1>
			{/if}
		{/each}
	</div>
</div>
