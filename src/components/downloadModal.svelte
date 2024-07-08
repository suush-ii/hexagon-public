<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { X } from 'lucide-svelte'
	import { Button } from './ui/button'
	import { env } from '$env/dynamic/public'

	let downloadOpen = false

	let afterDownload = false

	let uri: string

	export function open(_uri: string) {
		downloadOpen = true

		uri = _uri

		setTimeout(() => {
			downloadOpen = false
		}, 5000)
	}

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
				on:click={() => {
					afterDownload = true
				}}
				href={`https://${env.PUBLIC_setupcdn}/${type === 'player' ? 'HexagonPlayerLauncher' : 'HexagonStudioLauncherBeta'}.exe`}
				class="text-lg">Download and install</Button
			>
		</AlertDialog.Header>
	</AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root closeOnOutsideClick={false} bind:open={afterDownload}>
	<AlertDialog.Content class="space-y-8">
		<AlertDialog.Header>
			<button
				class="ml-auto"
				on:click={() => {
					afterDownload = false
				}}><X /></button
			>
			<img alt="H" class="w-32 mx-auto" src="/hexagon512.png" />
			<p class="mx-auto text-lg font-semibold">After installation click below!</p>
			<Button
				on:click={() => {
					if (uri) {
						document.location = uri
					}
				}}
				class="text-lg">Play</Button
			>
		</AlertDialog.Header>
	</AlertDialog.Content>
</AlertDialog.Root>
