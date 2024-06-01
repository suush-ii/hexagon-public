<script lang="ts">
	import * as Table from '$src/components/ui/table'
	import Avatar from '$src/components/users/avatar.svelte'
	import * as Select from '$src/components/ui/select'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import { pageName } from '$src/stores'
	import { MoonStar } from 'lucide-svelte'

	pageName.set('Transactions')

	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'

	export let data: PageData

	$: selected = {
		value: 'purchase',
		label: 'Purchases'
	}

	function changeCategory() {
		let query = new URLSearchParams($page.url.searchParams.toString())
		if (browser) {
			query.set('category', selected.value)

			goto(`?${query.toString()}`)
		}
	}

	$: selected, changeCategory()
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<div class="flex items-center gap-x-2">
		<h1>Transaction Type:</h1>

		<Select.Root bind:selected>
			<Select.Trigger class="w-[300px]">
				<Select.Value />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Item value={'purchase'} label={'Purchases'}>Purchases</Select.Item>
					<Select.Item value={'sales'} label={'Sales'}>Sales</Select.Item>
					<Select.Item value={'stipend'} label={'Stipend'}>Stipend</Select.Item>
				</Select.Group>
			</Select.Content>
			<Select.Input name="category" />
		</Select.Root>
	</div>

	<Table.Root class="">
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">Date</Table.Head>
				<Table.Head class="w-[150px]">Member</Table.Head>
				<Table.Head>Description</Table.Head>
				<Table.Head class="text-left w-[150px]">Amount</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if data.transactions}
				{#each data.transactions as transaction}
					<Table.Row>
						<Table.Cell>{transaction.time.toLocaleDateString('en-US')}</Table.Cell>
						{#if transaction.type === 'stipend' || transaction.type === 'adjustment'}
							<Table.Cell class="flex gap-x-2 items-center"
								><img src={'/hexagon128.png'} class="h-7 w-7" alt="Hexagon" />Hexagon</Table.Cell
							>
						{:else}
							<a href="/users/{transaction.sourceuserid ?? 0}/profile">
								<Table.Cell class="flex gap-x-2 items-center truncate w-[150px] hover:underline"
									><Avatar
										state={'offline'}
										userid={transaction.sourceuserid ?? 0}
										css="h-7 w-7"
										disableoutline={true}
									/>
									{transaction.member?.username}</Table.Cell
								></a
							>
						{/if}

						{#if transaction.type === 'stipend'}
							<Table.Cell>Daily Stipend</Table.Cell>
						{:else if transaction.type === 'adjustment'}
							<Table.Cell>Adjustment</Table.Cell>
						{:else if transaction.type === 'sales'}
							<Table.Cell
								>Sold <a class="hover:underline" href="/catalog/{transaction.itemid ?? 0}"
									>{transaction.item?.assetname}</a
								></Table.Cell
							>
						{:else}
							<Table.Cell
								>Purchased <a class="hover:underline" href="/catalog/{transaction.itemid ?? 0}"
									>{transaction.item?.assetname}</a
								></Table.Cell
							>
						{/if}

						<Table.Cell class="text-right flex gap-x-2 items-center"
							><MoonStar />{transaction.amount}</Table.Cell
						>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>

	<PaginationWrapper count={data.transactionsCount ?? 0} size={30} url={$page.url} />
</div>
