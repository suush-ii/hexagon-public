<script lang="ts">
	import Avatar from '$src/components/users/avatar.svelte'

	import { Button } from '$src/components/ui/button'

	import { Separator } from '$src/components/ui/separator'

	import type { instances } from '$lib/types'

	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	function placeLauncher(jobId: string) {
		dispatch('placelauncher', {
			jobId
		})
	}

	export let servers: instances

	export let serverSize: number
</script>

{#each servers as server}
	<div
		class="w-full supports-backdrop-blur:bg-background/60 bg-muted-foreground/5 backdrop-blur flex flex-row gap-x-2"
	>
		<div class="w-1/4">
			<h5>{server.active} of {serverSize} people max</h5>

			<Button
				variant="secondary"
				size="sm"
				class="w-full"
				on:click={() => {
					placeLauncher(server.jobid)
				}}>Join</Button
			>
		</div>

		<Separator orientation="vertical" />

		<div class="flex gap-x-4 flex-row flex-wrap p-4">
			{#each server.players ?? [] as player}
				<a href="/users/{player}/profile">
					<Avatar state={'game'} userid={player} css="h-14 w-14" disableoutline={true} />
				</a>
			{/each}
		</div>
	</div>
{/each}
