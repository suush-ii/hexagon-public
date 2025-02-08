<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { Separator } from '$src/components/ui/separator'
	import { Key } from 'lucide-svelte'
	import { Input } from '$src/components/ui/input'
	import { type Infer, type SuperForm } from 'sveltekit-superforms'
	import { formSchema } from '$lib/schemas/loginschema'
	import * as Form from '$src/components/ui/form'
	import { Button } from './ui/button'
	import Warntext from './warntext.svelte'

	export let _2faForm: SuperForm<Infer<typeof formSchema>>

	const { form: formData, submitting, message } = _2faForm

	let open2fa = false

	export function open() {
		open2fa = true
	}
</script>

<AlertDialog.Root closeOnOutsideClick={true} bind:open={open2fa}>
	<AlertDialog.Content class="space-y-2">
		<AlertDialog.Header class="space-y-6">
			<AlertDialog.Title class="text-xl font-semibold">
				Verify 2FA
				<Separator />
			</AlertDialog.Title>
		</AlertDialog.Header>

		<div class="flex flex-col mx-auto w-full">
			<Key class="w-full h-24 mx-auto" />

			<h1 class="flex items-center gap-x-1">Code:</h1>
			<Form.Field class="w-full" form={_2faForm} name="_2facode">
				<Form.Control let:attrs>
					<Input disabled={$submitting} type="number" {...attrs} bind:value={$formData._2facode} />
				</Form.Control>
				<Form.FieldErrors />

				<Form.Description>
					{#if $message}<Warntext text={$message} />{/if}
				</Form.Description>
			</Form.Field>
		</div>

		<AlertDialog.Footer class="mx-auto">
			<Button
				on:click={() => {
					_2faForm.submit()
				}}
				disabled={$submitting}>Verify</Button
			>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
