<script lang="ts">
	import Avatar from '$src/components/users/avatar.svelte'

	import { Button } from '$src/components/ui/button'

	import { Separator } from '$src/components/ui/separator'

	import type { instances } from '$lib/types'

	export let servers: instances

	export let serverSize: number

	export let placeid: number

	export let ticket: string
</script>

{#each servers as server}
	<div
		class="w-full supports-backdrop-blur:bg-background/60 bg-muted-foreground/5 backdrop-blur flex flex-row gap-x-2"
	>
		<div class="w-1/4">
			<h5>{server.active} of {serverSize} people max</h5>

			<Button
				on:click={() => {
					document.location = `hexagonlaunch://${placeid}[${ticket}[${2016}[player[${server.jobid}`
				}}
				variant="secondary"
				size="sm"
				class="w-full">Join</Button
			>
		</div>

		<Separator orientation="vertical" />

		<div class="flex-row flex-wrap">
			{#each server.players ?? [] as player}
				<Avatar state={'game'} userid={player} css="h-10 w-10" />
			{/each}
		</div>
	</div>
{/each}
