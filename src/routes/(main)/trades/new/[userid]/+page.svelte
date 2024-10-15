<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import { Input } from '$src/components/ui/input'
	import { Separator } from '$src/components/ui/separator'
	import { formatCompactNumber } from '$lib/utils'
	import { MoonStar } from 'lucide-svelte'
	import TradeCard from '$src/components/catalog/trade/tradeCard.svelte'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { formSchema } from '.'
	import SuperDebug from 'sveltekit-superforms'

	export let data: PageData

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		dataType: 'json',
		resetForm: false
	})

	const { form: formData, enhance, errors, submitting, message } = form

	type item = {
		itemName: string
		originalprice: number
		recentaverageprice: number
		serial: number
		sold: number
		itemId: number
		inventoryid: number
	}

	let trade = {
		offering: {
			title: 'Your Offer',
			value: 0,
			items: [] as item[],
			moons: null
		},
		requesting: {
			title: 'Your Request',
			value: 0,
			items: [] as item[],
			moons: null
		}
	}

	if (data.trade?.requesting && trade?.offering.items) {
		trade.offering.items = data.trade.requesting as item[]
		trade.offering.items = trade.offering.items

		trade.offering.value = trade.offering.items.reduce(
			(acc, curr) => acc + curr.recentaverageprice,
			0
		)
	}

	if (data.trade?.offering && trade?.requesting.items) {
		trade.requesting.items = data.trade.offering as item[]
		trade.requesting.items = trade.requesting.items

		trade.requesting.value = trade.requesting.items.reduce(
			(acc, curr) => acc + curr.recentaverageprice,
			0
		)
	}

	$: entries = Object.entries(trade)

	function add(type: 'offering' | 'requesting', item: item) {
		if (trade[type].items.length >= 4) return

		trade[type].items.push({
			itemName: item.itemName,
			itemId: item.itemId,
			originalprice: item.originalprice,
			recentaverageprice: item.recentaverageprice,
			serial: item.serial,
			sold: item.sold,
			inventoryid: item.inventoryid
		})

		trade[type].value += item.recentaverageprice

		trade[type].items = trade[type].items
	}

	$: {
		$formData.offering = {
			items: trade.offering.items.map((i) => i.inventoryid),
			moons: trade.offering.moons ?? undefined
		}
		$formData.requesting = {
			items: trade.requesting.items.map((i) => i.inventoryid),
			moons: trade.requesting.moons ?? undefined
		}
	}
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Trading</h1>

	<div class="flex flex-wrap gap-x-6">
		<form
			method="POST"
			class="flex flex-col p-6 gap-y-16 bg-muted-foreground/5 rounded-xl border h-fit"
			use:enhance
		>
			{#each entries as [key, value]}
				<div class="flex flex-col gap-y-4">
					<div class="flex justify-between">
						<h1 class="text-xl">{value.title}</h1>

						<h1 class="flex items-center">
							<span class="text-muted-foreground">Value: </span>
							<MoonStar class="h-4 " />{formatCompactNumber(value.value, false)}
						</h1>
					</div>

					<div class="flex gap-x-2">
						{#each value.items as offer}
							<div class="w-24 h-24">
								<TradeCard
									itemName={offer.itemName ?? ''}
									itemId={offer.itemId}
									originalprice={offer.originalprice ?? 0}
									recentaverageprice={offer.recentaverageprice ?? 0}
									serial={offer.serial ?? 0}
									sold={offer.sold ?? 0}
									selected={true}
									on:move={() => {
										value.items = value.items.filter((i) => i.inventoryid !== offer.inventoryid)
										value.value -= offer.recentaverageprice

										trade.offering.items = trade.offering.items
									}}
								/>
							</div>
						{/each}

						{#if value.items.length < 4}
							{#each Array(4 - value.items.length) as _}
								<div class="w-24 h-24 bg-muted-foreground/5 rounded-xl mt-6"></div>
							{/each}
						{/if}
					</div>

					<div class="flex flex-col gap-x-2 mx-auto">
						<h1 class="text-lg text-muted-foreground flex items-center">
							Plus: <span class="text-foreground"><MoonStar class="h-4 " /> </span>
							<Input
								type="number"
								class="text-foreground"
								bind:value={value.moons}
								placeholder="Enter amount"
							/>
						</h1>

						{#if $errors?.offering?.moons && key === 'offering'}
							<h1 class="text-destructive text-sm text-center">{$errors?.offering?.moons}</h1>
						{/if}

						{#if $errors?.requesting?.moons && key === 'requesting'}
							<h1 class="text-destructive text-sm text-center">{$errors?.requesting?.moons}</h1>
						{/if}
					</div>

					{#if $errors?.offering?.items?._errors && key === 'offering'}
						<h1 class="text-destructive text-sm text-center">{$errors.offering.items?._errors}</h1>
					{/if}

					{#if $errors?.requesting?.items && key === 'requesting'}
						<h1 class="text-destructive text-sm text-center">
							{$errors?.requesting?.items}
						</h1>
					{/if}
				</div>

				{#if key === 'offering'}
					<Separator />
				{/if}
			{/each}

			<div class="flex flex-col gap-y-2">
				{#if $errors?._errors || $message}
					<h1 class="text-destructive text-sm text-center">{$errors._errors ?? $message}</h1>
				{/if}

				<Button type="submit" size="lg" class="px-4" variant="outline" disabled={$submitting}
					>Send Request</Button
				>
			</div>
		</form>

		<div class="flex flex-col gap-y-4 grow">
			<h1 class="text-xl">Your Inventory</h1>

			<div class="flex gap-x-4 p-4 min-h-96">
				{#each data.inventory as item}
					{#if trade.offering.items.find((i) => i.inventoryid === item.inventoryid) === undefined}
						<TradeCard
							itemName={item.assetname}
							itemId={item.assetid}
							originalprice={item.originalprice ?? 0}
							recentaverageprice={item.recentaverageprice ?? 0}
							serial={item.serial ?? 0}
							sold={item.sold ?? 0}
							selected={false}
							on:move={() => {
								add('offering', {
									itemName: item.assetname,
									itemId: item.assetid,
									originalprice: item.originalprice ?? 0,
									recentaverageprice: item.recentaverageprice ?? 0,
									serial: item.serial ?? 0,
									sold: item.sold,
									inventoryid: item.inventoryid
								})
							}}
						/>
					{/if}
				{/each}
			</div>

			<PaginationWrapper count={0} size={28} url={$page.url} />

			<Separator />

			<h1 class="text-xl">{data.user.username}'s Inventory</h1>

			<div class="flex gap-x-4 p-4 h-full min-h-96">
				{#each data.inventoryOther as item}
					{#if trade.requesting.items.find((i) => i.inventoryid === item.inventoryid) === undefined}
						<TradeCard
							itemName={item.assetname}
							itemId={item.assetid}
							originalprice={item.originalprice ?? 0}
							recentaverageprice={item.recentaverageprice ?? 0}
							serial={item.serial ?? 0}
							sold={item.sold ?? 0}
							selected={false}
							on:move={() => {
								add('requesting', {
									itemName: item.assetname,
									itemId: item.assetid,
									originalprice: item.originalprice ?? 0,
									recentaverageprice: item.recentaverageprice ?? 0,
									serial: item.serial ?? 0,
									sold: item.sold,
									inventoryid: item.inventoryid
								})
							}}
						/>
					{/if}
				{/each}
			</div>
			<PaginationWrapper count={0} size={28} url={$page.url} />
		</div>
	</div>
</div>
