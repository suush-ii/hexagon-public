<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { X } from 'lucide-svelte'
	import { Button } from './ui/button'
	import { env } from '$env/dynamic/public'

	export let downloadOpen = false

	export let type: 'studio' | 'player'
</script>

<AlertDialog.Root closeOnOutsideClick={false} bind:open={downloadOpen}>
	<AlertDialog.Content class="space-y-8">
		<AlertDialog.Header>
			<button
				class="ml-auto"
				on:click={() => {
					downloadOpen = false
				}}><X /></button
			>
			<img alt="H" class="w-32 mx-auto" src="/hexagon512.png" />
			<p class="mx-auto text-lg font-semibold">Need to download?</p>
			<Button
				href={`https://${env.PUBLIC_setupcdn}/${type === 'player' ? 'HexagonPlayerLauncher' : 'HexagonStudioLauncherBeta'}.exe`}
				class="text-lg">Download and install</Button
			>
		</AlertDialog.Header>
	</AlertDialog.Content>
</AlertDialog.Root>
