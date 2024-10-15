<script lang="ts">
	import * as Table from '$src/components/ui/table'
	import Avatar from '$src/components/users/avatar.svelte'
	import * as Select from '$src/components/ui/select'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import TradeModal from '$src/components/catalog/trade/tradeModal.svelte'

	import { pageName } from '$src/stores'

	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'

	export let data: PageData

	let tradeModal: TradeModal

	pageName.set('Trades')

	$: selected = {
		value: 'inbound',
		label: 'Inbound'
	}

	function changeType() {
		let query = new URLSearchParams($page.url.searchParams.toString())
		if (browser) {
			query.set('type', selected.value)

			goto(`?${query.toString()}`)
		}
	}

	$: selected, changeType()

	$: id = 0

	$: user = ''

	$: offeringmoons = 0

	$: requestingmoons = 0

	$: requestid = 0

	$: offering = [] as unknown

	$: requesting = [] as unknown

	$: userid = data.user.userid

	let message = ''

	type userType = {
		username: string
		userid: number
	}

	function tradePartner(sender: userType, recepient: userType) {
		return sender.userid == userid ? recepient : sender
	}
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<div class="flex items-center gap-x-2">
		<h1>Trade Type:</h1>

		<Select.Root bind:selected>
			<Select.Trigger class="w-[300px]">
				<Select.Value />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Item value={'inbound'} label={'Inbound'}>{'Inbound'}</Select.Item>
					<Select.Item value={'outbound'} label={'Outbound'}>{'Outbound'}</Select.Item>
					<Select.Item value={'completed'} label={'Completed'}>{'Completed'}</Select.Item>
					<Select.Item value={'inactive'} label={'Inactive'}>{'Inactive'}</Select.Item>
				</Select.Group>
			</Select.Content>
			<Select.Input name="category" />
		</Select.Root>
	</div>
	{#if message !== ''}
		<div class="py-2 px-4 bg-blue-500/80 rounded-xl">
			<h1>{message}</h1>
		</div>
	{/if}

	<Table.Root class="">
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">{data.t('transactions.date')}</Table.Head>
				<Table.Head class="w-[100px]">Expires</Table.Head>
				<Table.Head class="w-[200px]">Trade Partner</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head class="text-left w-[150px]">Action</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if data.trades}
				{#each data.trades as trade}
					<Table.Row>
						<Table.Cell>{trade.time.toLocaleDateString('en-US')}</Table.Cell>
						<Table.Cell>{trade.time.toLocaleDateString('en-US')}</Table.Cell>
						<Table.Cell>
							<a href="/users/{tradePartner(trade.sender, trade.recepient).userid}/profile">
								<Table.Cell class="flex gap-x-2 items-center truncate w-[150px] hover:underline"
									><Avatar
										state={'offline'}
										userid={tradePartner(trade.sender, trade.recepient).userid}
										css="h-7 w-7"
										disableoutline={true}
									/>
									{tradePartner(trade.sender, trade.recepient).username}</Table.Cell
								></a
							>
						</Table.Cell>

						<Table.Cell>
							{#if trade.status === 'pending'}
								Pending approval
							{:else if trade.status === 'denied' && trade.denyreason === 'error'}
								Trade failed due to an error
							{:else if trade.status === 'denied' && trade.denyreason === 'countered'}
								Trade Countered
							{:else if trade.status === 'denied'}
								Trade Denied
							{:else}
								Trade Accepted
							{/if}
						</Table.Cell>

						<Table.Cell
							><button
								on:click={() => {
									id = tradePartner(trade.sender, trade.recepient).userid
									user = tradePartner(trade.sender, trade.recepient).username
									requestid = trade.requestid
									if (trade.sender === tradePartner(trade.sender, trade.recepient)) {
										requesting = trade.requesting
										offering = trade.offering
										offeringmoons = trade.offeringmoons
										requestingmoons = trade.requestingmoons
									} else {
										requesting = trade.offering
										offering = trade.requesting
										offeringmoons = trade.requestingmoons
										requestingmoons = trade.offeringmoons
									}

									tradeModal.open()
								}}>View Details</button
							></Table.Cell
						>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>

	<div class="mt-auto">
		<PaginationWrapper count={data.tradesCount} size={30} url={$page.url} />
	</div>
</div>

<TradeModal
	bind:this={tradeModal}
	bind:message
	userid={id}
	username={user}
	tradeForm={data.tradeForm}
	{offering}
	{requesting}
	{offeringmoons}
	{requestingmoons}
	{requestid}
	override={false}
/>
