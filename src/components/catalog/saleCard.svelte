<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import Avatar from '$src/components/catalog/avatar.svelte'
	import UserAvatar from '$src/components/users/avatar.svelte'
	import { formatCompactNumber } from '$lib/utils'
	import { MoonStar, Loader2, X } from 'lucide-svelte'
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms'
	import {
		formSchema as inventoryIdSchema,
		type FormSchema as InventoryIdSchema
	} from '$lib/schemas/catalog/inventoryidschema'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { page } from '$app/stores'
	import { Separator } from '../ui/separator'
	import { Button } from '../ui/button'

	export let price: number
	export let sold: number
	export let serial: number
	export let inventoryid: number
	export let userid: number
	export let currentid: number
	export let assetid: number
	export let username: string
	export let assetname: string

	export let data: SuperValidated<Infer<InventoryIdSchema>>

	let open = false

	let form = superForm(data, {
		validators: zodClient(inventoryIdSchema),
		onResult: async (result) => {
			if (result.result.type === 'success') {
				open = false
			}
		}
	})

	const { form: formData, enhance, submitting, constraints } = form
</script>

<div class="flex gap-x-4 items-center p-2">
	<a href="/users/{userid}/profile"
		><UserAvatar css="rounded-xl" {userid} {username} type="avatar" disable3d={true} /></a
	>

	<div class="flex flex-col gap-y-1">
		<a href="/users/{userid}/profile"
			><h1 class="text-lg hover:underline underline-offset-2">{username}</h1></a
		>

		<div class="flex items-center gap-x-1">
			<MoonStar class="h-5" />
			<h5 class="font-bold">{formatCompactNumber(price, false)}</h5>
		</div>

		{#if serial !== 0}
			<h5 class="text-lg text-muted-foreground">Serial #{serial} of {sold}</h5>
		{:else}
			<h5 class="text-lg text-muted-foreground">Serial N/A</h5>
		{/if}
	</div>
	{#if userid == currentid}
		<form method="POST" action="?/removelimited" use:enhance class="ml-auto">
			<Form.Button disabled={$submitting}
				>{#if $submitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Take Off Sale
			</Form.Button>

			<input name="inventoryId" value={inventoryid} hidden />
		</form>
	{:else}
		<AlertDialog.Root closeOnOutsideClick={true} bind:open>
			<AlertDialog.Trigger asChild let:builder>
				{#if price > $page.data.user.coins}
					<Button class="ml-auto" builders={[builder]} disabled>
						{$page.data.t('catalog.notEnough')}</Button
					>
				{:else}
					<Button class="ml-auto" builders={[builder]}>Buy Now</Button>
				{/if}
			</AlertDialog.Trigger>

			<AlertDialog.Content>
				<form method="POST" action="?/buylimited" use:enhance>
					<input name="inventoryId" value={inventoryid} hidden />

					<AlertDialog.Header>
						<AlertDialog.Title class="text-xl font-semibold">
							<div class="flex justify-between">
								Buy Item

								<button
									on:click={() => {
										open = false
									}}><X /></button
								>
							</div>

							<Separator />
						</AlertDialog.Title>
						<AlertDialog.Description class="text-lg flex flex-col gap-y-4">
							<div class="flex flex-row flex-wrap line-clamp-2 break-all">
								Would you like to buy the Asset "{assetname}" from {username} for
								<span class="text-primary flex flex-row align-middle"
									><MoonStar class="h-4 my-auto " />
									{price}</span
								>?
							</div>
							<Avatar
								css="mx-auto aspect-square w-40 rounded-xl"
								itemId={assetid}
								itemName={assetname}
								disable3d={true}
							/>
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<div class="mx-auto flex">
							<Form.Button disabled={$submitting}>Buy Now</Form.Button>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
						</div>
					</AlertDialog.Footer>
				</form>
			</AlertDialog.Content>
		</AlertDialog.Root>
	{/if}
</div>
