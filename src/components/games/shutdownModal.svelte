<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { Separator } from '../ui/separator'

	export let shutdownForm: HTMLFormElement

	let openShutdown = false

	let submitting = false

	export function open() {
		openShutdown = true
	}

	function shutdown() {
		submitting = true

		shutdownForm.submit()
	}
</script>

<AlertDialog.Root closeOnOutsideClick={true} bind:open={openShutdown}>
	<AlertDialog.Content class="space-y-2">
		<AlertDialog.Header class="space-y-6">
			<AlertDialog.Title class="text-xl font-semibold">
				Shut Down All Servers
				<Separator />
			</AlertDialog.Title>
			<AlertDialog.Description class="text-lg">
				Are you sure you want to shut down all servers for this place?
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer class="mx-auto">
			<AlertDialog.Action disabled={submitting} on:click={shutdown}>Yes</AlertDialog.Action>
			<AlertDialog.Cancel>No</AlertDialog.Cancel>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
