<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import UserAvatar from '$src/components/users/avatar.svelte'
	import { X, MoonStar } from 'lucide-svelte'
	import { Separator } from '$src/components/ui/separator'
	import TradeCard from './tradeCard.svelte'
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms'
	import { type FormSchema, formSchema } from '$lib/schemas/catalog/tradeschema'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form'
	import { page } from '$app/stores'
	import { Button } from '$src/components/ui/button'

	let openTrade = false

	export function open() {
		openTrade = true
	}

	export let tradeForm: SuperValidated<Infer<FormSchema>>

	let form = superForm(tradeForm, {
		validators: zodClient(formSchema),
		onResult: async () => {
			openTrade = false
		}
	})

	const { form: formData, enhance, submitting, message: messageData } = form

	export let userid: number

	export let username: string

	export let offeringmoons: number

	export let requestingmoons: number

	export let requestid: number

	export let offering: any

	export let requesting: any

	export let message: string

	export let override: boolean

	$: message = $messageData ?? ''

	$: type = $page.url.searchParams.get('type') ?? 'inbound'
</script>

<AlertDialog.Root closeOnOutsideClick={true} bind:open={openTrade}>
	<AlertDialog.Content class="max-w-3xl">
		<form method="POST" class="space-y-12 max-w-3xl" action="?/trade" use:enhance>
			<AlertDialog.Header>
				<AlertDialog.Title class="text-2xl text-center font-semibold flex items-center">
					<h1 class="w-full">Trade Request</h1>
					<button
						type="button"
						on:click={() => {
							openTrade = false
						}}><X /></button
					>
				</AlertDialog.Title>
			</AlertDialog.Header>
			<div class="flex gap-x-4">
				<div class="flex flex-col gap-y-4 max-w-40">
					<a href="/users/{userid}/profile" class="hover:underline"
						><UserAvatar css="rounded-xl" {userid} {username} type="avatar" disable3d={true} /></a
					>

					<h1>
						Trade was opened with <a href="/users/{userid}/profile" class="hover:underline"
							>{username}</a
						>
					</h1>
				</div>

				<Separator orientation="vertical" />

				<div class="flex flex-col gap-y-4">
					<div>
						{#if type === 'inbound' || type === 'outbound'}
							<h1 class="text-lg">Items you will give</h1>
						{:else if type === 'completed'}
							<h1 class="text-lg">Items you gave</h1>
						{:else if type === 'inactive'}
							<h1 class="text-lg">Items you would have given</h1>
						{/if}

						<div class="flex gap-x-2">
							{#each requesting as offer}
								<div class="w-24 h-24">
									<TradeCard
										itemName={offer.assetname ?? ''}
										itemId={offer.itemid}
										originalprice={offer.originalprice ?? 0}
										recentaverageprice={offer.recentaverageprice ?? 0}
										serial={offer.serial ?? 0}
										sold={offer.sales ?? 0}
										selected={false}
										tradeRequest={true}
									/>
								</div>
							{/each}

							{#if requesting.length < 4}
								{#each Array(4 - requesting.length) as _}
									<div class="w-24 h-24 bg-muted-foreground/5 rounded-xl mt-6"></div>
								{/each}
							{/if}

							<div
								class="w-24 h-24 bg-muted-foreground/5 rounded-xl mt-6 text-center flex flex-col"
							>
								{#if requestingmoons > 0}
									<h1 class="tracking-tighter">{requestingmoons} moons</h1>

									<MoonStar class="h-full w-full p-4" />
								{/if}
							</div>
						</div>
					</div>

					<Separator />

					<div>
						{#if type === 'inbound' || type === 'outbound'}
							<h1 class="text-lg">Items you will receive</h1>
						{:else if type === 'completed'}
							<h1 class="text-lg">Items you received</h1>
						{:else if type === 'inactive'}
							<h1 class="text-lg">Items you would have received</h1>
						{/if}

						<div class="flex gap-x-2">
							{#each offering as offer}
								<div class="w-24 h-24">
									<TradeCard
										itemName={offer.assetname ?? ''}
										itemId={offer.itemid}
										originalprice={offer.originalprice ?? 0}
										recentaverageprice={offer.recentaverageprice ?? 0}
										serial={offer.serial ?? 0}
										sold={offer.sales ?? 0}
										selected={false}
										tradeRequest={true}
									/>
								</div>
							{/each}

							{#if offering.length < 4}
								{#each Array(4 - offering.length) as _}
									<div class="w-24 h-24 bg-muted-foreground/5 rounded-xl mt-6"></div>
								{/each}
							{/if}

							<div
								class="w-24 h-24 bg-muted-foreground/5 rounded-xl mt-6 text-center flex flex-col"
							>
								{#if offeringmoons > 0}
									<h1 class="tracking-tighter">{offeringmoons} moons</h1>

									<MoonStar class="h-full w-full p-4" />
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<input type="hidden" name="requestid" value={requestid} />

			<div class="flex gap-x-2 mx-auto w-full justify-center">
				{#if type === 'inbound' && !override}
					<Form.Button disabled={$submitting} type="submit" name="action" value="accept" size="lg"
						>Accept</Form.Button
					>
					<a href="/trades/new/{userid}?trade={requestid}"
						><Button disabled={$submitting} size="lg">Counter</Button></a
					>
					<Form.Button
						disabled={$submitting}
						type="submit"
						name="action"
						value="decline"
						size="lg"
						variant="outline">Decline</Form.Button
					>
				{:else}
					<Button
						disabled={$submitting}
						size="lg"
						type="button"
						on:click={() => {
							openTrade = false
						}}>Close</Button
					>
				{/if}
			</div>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
