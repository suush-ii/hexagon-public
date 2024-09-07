<script lang="ts">
	import { invalidate } from '$app/navigation'
	import { Button } from '$src/components/ui/button'
	import { Loader2 } from 'lucide-svelte'

	import QueueCard from '$src/components/admin/queuecard.svelte'
	import EmptyCard from '$src/components/emptyCard.svelte'

	import { pageName } from '$src/stores'

	pageName.set('Admin')

	import type { PageData } from './$types'

	export let data: PageData

	let submitting = false

	async function submitAsssets() {
		submitting = true

		const assetsToSend = data.assets
			.filter((asset) => asset.moderationState !== 'pending')
			.map((asset) => ({
				assetId: asset.assetId,
				moderationState: asset.moderationState,
				punish: asset.punish
			}))

		const response = await fetch('/api/admin/approveAssets', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(assetsToSend)
		})

		invalidate('app:assetqueue')

		submitting = false
	}
</script>

<svelte:window
	on:keyup={(event) => {
		if (event.key === 'Enter') {
			submitAsssets()
		}
	}}
/>

<div class="p-8 flex flex-col space-y-4 grow">
	<h1 class="text-xl">Queue: {data.assetCount}</h1>
	<h1 class="text-xl">You can press enter instead of submit</h1>

	<div class="flex flex-row">
		<div class="flex flex-row flex-wrap grow gap-x-8">
			{#each data.assets as asset}
				<QueueCard
					bind:moderationState={asset.moderationState}
					bind:punish={asset.punish}
					assetType={asset.assetType}
					assetName={asset.assetName}
					assetUrl={asset.assetUrl}
					username={asset.creatorusername}
					userId={asset.creatorUserId}
				/>
			{/each}
			{#if data?.assets?.length === 0}
				<EmptyCard />
			{/if}
		</div>

		<Button on:click={submitAsssets} variant="outline" class="grow max-w-60" disabled={submitting}
			>{#if submitting}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Submit</Button
		>
	</div>
</div>
