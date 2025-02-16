<script lang="ts">
	import * as Table from '$src/components/ui/table'
	import Avatar from '$src/components/users/avatar.svelte'
	import * as Select from '$src/components/ui/select'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import { pageName } from '$src/stores'
	import { MoonStar } from 'lucide-svelte'

	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'

	export let data: PageData

	pageName.set('Transactions')

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
		<h1>{data.t('transactions.transactionType')}</h1>

		<Select.Root bind:selected>
			<Select.Trigger class="w-[300px]">
				<Select.Value />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Item value={'purchase'} label={data.t('transactions.purchases')}
						>{data.t('transactions.purchases')}</Select.Item
					>
					<Select.Item value={'sales'} label={data.t('catalog.sales')}
						>{data.t('catalog.sales')}</Select.Item
					>
					<Select.Item value={'stipend'} label={data.t('transactions.stipend')}
						>{data.t('transactions.stipend')}</Select.Item
					>
				</Select.Group>
			</Select.Content>
			<Select.Input name="category" />
		</Select.Root>
	</div>

	<Table.Root class="">
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">{data.t('transactions.date')}</Table.Head>
				<Table.Head class="w-[150px]">{data.t('transactions.member')}</Table.Head>
				<Table.Head>{data.t('games.description')}</Table.Head>
				<Table.Head class="text-left w-[150px]">{data.t('transactions.amount')}</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if data.transactions}
				{#each data.transactions as transaction}
					<Table.Row>
						<Table.Cell>{transaction.time.toLocaleDateString('en-US')}</Table.Cell>
						{#if transaction.type === 'stipend' || transaction.type === 'adjustment' || !transaction.sourceuserid}
							<Table.Cell class="flex gap-x-2 items-center"
								><img src={'/hexagon128.png'} class="h-7 w-7" alt="Hexagon" />Hexagon</Table.Cell
							>
						{:else}
							<a href="/users/{transaction.sourceuserid}/profile">
								<Table.Cell class="flex gap-x-2 items-center truncate w-[150px] hover:underline"
									><Avatar
										state={'offline'}
										userid={transaction.sourceuserid}
										css="h-7 w-7"
										disableoutline={true}
									/>
									{transaction.member?.username}</Table.Cell
								></a
							>
						{/if}

						{#if transaction.type === 'stipend'}
							<Table.Cell>{data.t('transactions.dailyStipend')}</Table.Cell>
						{:else if transaction.type === 'adjustment'}
							<Table.Cell>{data.t('transactions.adjustment')}</Table.Cell>
						{:else if transaction.type === 'purchasebid'}
							<Table.Cell>{data.t('transactions.purchased')} Bid</Table.Cell>
						{:else if transaction.type === 'sales'}
							<Table.Cell
								>{data.t('transactions.sold')}
								<a class="hover:underline" href="/catalog/{transaction.itemid ?? 0}"
									>{transaction.item?.assetname}</a
								></Table.Cell
							>
						{:else}
							<Table.Cell
								>{data.t('transactions.purchased')}
								<a class="hover:underline" href="/catalog/{transaction.itemid ?? 0}"
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

	<div class="mt-auto">
		<PaginationWrapper count={data.transactionsCount ?? 0} size={30} url={$page.url} />
	</div>
</div>
