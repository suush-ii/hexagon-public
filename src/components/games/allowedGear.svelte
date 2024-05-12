<script lang="ts">
	import type { GearAttributes as gears } from '$lib/types'
	import { Ban, Briefcase } from 'lucide-svelte'

	import * as Tooltip from '$src/components/ui/tooltip'

	import GearAttributes from '$src/components/catalog/gearattributes.svelte'

	export let allowedGear: gears[]

	export let genreEnforcement: boolean

	export let gameGenre: String
</script>

<div class="flex flex-wrap gap-x-2 justify-center w-24">
	{#if allowedGear.length > 0}
		{#if genreEnforcement}
			<Tooltip.Root openDelay={0}>
				<Tooltip.Trigger><Briefcase /></Tooltip.Trigger>
				<Tooltip.Content>
					<p>{gameGenre} Gear Only</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}

		{#each allowedGear as gear}
			<Tooltip.Root openDelay={0}>
				<Tooltip.Trigger><GearAttributes showName={false} attribute={gear} /></Tooltip.Trigger>
				<Tooltip.Content>
					<p>{gear}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/each}
	{:else}
		<Tooltip.Root openDelay={0}>
			<Tooltip.Trigger><Ban /></Tooltip.Trigger>
			<Tooltip.Content>
				<p>No gear allowed</p>
			</Tooltip.Content>
		</Tooltip.Root>
	{/if}
</div>
