<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'

	import { clanImages, friendlyClanNames } from '$lib'
	import { clanDescriptions } from './clans'
	import type { PageData } from './$types'
	import { Button } from '$src/components/ui/button'
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { formSchema } from './clans'
	import { hexagonClans } from '$lib'

	export let data: PageData

	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	})

	const { enhance, submitting, message } = form
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Clans</h1>

	<div class="flex flex-col gap-y-4">
		<form method="POST" class="flex flex-col gap-y-6" use:enhance>
			{#each hexagonClans as clan}
				<div
					class="flex gap-x-8 p-4 rounded-xl {data.clanUrl === clan
						? 'bg-muted-foreground/10'
						: ''}"
				>
					<div class="w-24 h-24">
						<Avatar.Root class="w-full h-full rounded-xl aspect-square">
							<Avatar.Image src={clanImages[clan]} alt={friendlyClanNames[clan]} />
							<Avatar.Fallback />
						</Avatar.Root>
					</div>

					<div class="flex flex-col gap-y-4">
						<h1 class="text-2xl">{friendlyClanNames[clan]}</h1>

						<h2 class="whitespace-pre-line">{clanDescriptions[clan]}</h2>
					</div>

					<Button
						class="ml-auto my-auto"
						size="lg"
						variant="outline"
						type="submit"
						name="clan"
						value={clan}
						disabled={$submitting}
					>
						{#if data.clan === clan}
							Leave
						{:else}
							Join
						{/if}
					</Button>
				</div>
			{/each}
		</form>

		{#if $message}
			<h2 class="text-destructive">{$message}</h2>
		{/if}
	</div>
</div>
