<script lang="ts">
	import { Power } from 'lucide-svelte'
	import { Input } from '../ui/input'
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms'
	import { type FormSchema, formSchema } from '$src/lib/schemas/develop/bidschema'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form'
	import Button from '../ui/button/button.svelte'
	import type { assetStates } from '$lib/types'

	export let adStats:
		| {
				impressionscurrent: number
				impressionstotal: number
				clickscurrent: number
				clickstotal: number
				bid: number
				totalbid: number
				associatedname: string
				associatedassetid: number
				associatedassettype: string
				useradid: number
				bidexpires: Date
				moderationstate: assetStates
		  }
		| undefined

	let openForm = false

	export let userAdForm: SuperValidated<Infer<FormSchema>>

	let form = superForm(userAdForm, {
		validators: zodClient(formSchema),
		onResult: async (result) => {
			if (result.result.type === 'success') {
				openForm = false
			}
		}
	})

	const { form: formData, enhance, submitting } = form

	$formData.adId = Number(adStats?.useradid)

	function round(value: number) {
		if (isNaN(value)) return 0

		return Math.round((value + Number.EPSILON) * 100) / 100
	}
</script>

{#if adStats}
	<tr class="align-text-top flex gap-x-16">
		<div class="flex flex-col">
			<td class="text-sm flex gap-x-1">
				<span class="text-muted-foreground">Impressions:</span>{adStats?.impressionscurrent}</td
			>
			<td class="text-sm flex gap-x-1">
				<span class="text-muted-foreground">Total Impr:</span>{adStats?.impressionstotal}</td
			>
			<td class="text-sm">
				<button
					class="flex gap-x-2 items-center"
					on:click={() => (openForm = !openForm)}
					disabled={adStats?.bidexpires > new Date() || adStats?.moderationstate !== 'approved'}
				>
					{#if adStats?.bidexpires > new Date()}
						<div class="bg-success w-4.5 h-4.5">
							<Power class="w-4 h-4 m-auto" />
						</div>

						<span class="text-muted-foreground">Active</span>
					{:else if adStats?.moderationstate !== 'approved'}
						<div class="bg-muted-foreground w-4.5 h-4.5">
							<Power class="w-4 h-4 m-auto" />
						</div>

						<span class="text-muted-foreground">Pending</span>
					{:else}
						<div class="bg-muted-foreground w-4.5 h-4.5">
							<Power class="w-4 h-4 m-auto" />
						</div>

						<span class="text-muted-foreground">Not running</span>
					{/if}
				</button>
			</td>
		</div>
		<div class="flex flex-col">
			<td class="text-sm flex gap-x-1">
				<span class="text-muted-foreground">Clicks:</span>{adStats?.clickscurrent}</td
			>
			<td class="text-sm flex gap-x-1">
				<span class="text-muted-foreground">Total Clicks:</span>{adStats?.clickstotal}</td
			>
		</div>
		<div class="flex flex-col">
			<td class="text-sm flex gap-x-1">
				<span class="text-muted-foreground">CTR:</span>{round(
					(adStats.clickscurrent / adStats.impressionscurrent) * 100
				)}%</td
			>
			<td class="text-sm flex gap-x-1">
				<span class="text-muted-foreground">Total CTR:</span>{round(
					(adStats.clickstotal / adStats.impressionstotal) * 100
				)}%</td
			>
		</div>
		<div class=" flex flex-col">
			<td class="text-sm flex gap-x-1">
				<span class="text-muted-foreground">Bid:</span>{adStats?.bid}</td
			>
			<td class="text-sm flex gap-x-1">
				<span class="text-muted-foreground">Total Bid:</span>{adStats?.totalbid}</td
			>
		</div>
	</tr>
{/if}

{#if openForm}
	<div class="text-sm max-w-96 absolute">
		<form class="flex items-center gap-x-4" action="?/bid" method="POST" use:enhance>
			Bid:
			<Form.Field {form} name="bid">
				<Form.Control let:attrs>
					<Input min={1} disabled={$submitting} {...attrs} bind:value={$formData.bid} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<input type="hidden" name="adId" value={$formData.adId} />

			<Form.Button disabled={$submitting} class="px-5 h-8" size="sm">Run</Form.Button>
			<Button class="px-5 h-8" variant="outline" size="sm" on:click={() => (openForm = !openForm)}
				>Cancel</Button
			>
		</form>
		<span class="text-muted-foreground">Note: All ads run for 24 hours.</span>
	</div>
{/if}
