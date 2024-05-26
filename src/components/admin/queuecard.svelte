<script lang="ts">
	import * as Card from '$src/components/ui/card'
	import { Button } from '$src/components/ui/button'
	import { Check, X } from 'lucide-svelte'
	import Assetcardprimitive from './assetcardprimitive.svelte'

	import type { assetStates } from '$lib/types'

	export let assetType: string
	export let assetName: string
	export let assetUrl: string | null

	export let moderationState: assetStates

	export let punish: boolean
</script>

<Card.Root class="w-[350px] flex flex-col">
	<Assetcardprimitive {assetName} {assetType} {assetUrl} />

	<Card.Footer class="flex justify-between gap-x-2 mt-auto">
		<Button
			variant="outline"
			on:click={() => {
				moderationState = 'rejected'
				punish = true
			}}
			class="bg-destructive w-full"
			>{#if moderationState === 'rejected' && punish === true}<X />{:else}Punish{/if}</Button
		>

		<Button
			variant="outline"
			on:click={() => {
				moderationState = 'rejected'
				punish = false
			}}
			class="w-full"
			>{#if moderationState === 'rejected' && punish === false}<X />{:else}Deny{/if}</Button
		>
		<Button
			variant="outline"
			on:click={() => {
				moderationState = 'approved'
				punish = false
			}}
			class="bg-success w-full"
			>{#if moderationState === 'approved'}<Check />{:else}Approve{/if}</Button
		>
	</Card.Footer>
</Card.Root>
