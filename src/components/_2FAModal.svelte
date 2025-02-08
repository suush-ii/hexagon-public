<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { Separator } from '$src/components/ui/separator'
	import { Input } from '$src/components/ui/input'
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms'
	import { type FormSchema, formSchema } from '$src/lib/schemas/2faenableschema'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form'

	export let _2faForm: SuperValidated<Infer<FormSchema>>

	export let url: string

	export let secret: string

	let form = superForm(_2faForm, {
		validators: zodClient(formSchema),
		onResult: async (result) => {
			if (result.result.type === 'success') {
				open2fa = false
			}
		}
	})

	const { form: formData, enhance, submitting } = form

	let open2fa = false

	export function open() {
		open2fa = true

		$formData.secret = secret
	}

	$formData.secret = secret
</script>

<AlertDialog.Root closeOnOutsideClick={true} bind:open={open2fa}>
	<AlertDialog.Content class="space-y-2">
		<form method="POST" class="space-y-2 flex flex-col" action="?/_2fa" use:enhance>
			<AlertDialog.Header class="space-y-6">
				<AlertDialog.Title class="text-xl font-semibold">
					2FA Setup
					<Separator />
				</AlertDialog.Title>
			</AlertDialog.Header>

			<div class="flex flex-col mx-auto w-full">
				<img class="max-w-lg mx-auto" src={url} alt="QR Code" />

				<h1 class="flex items-center gap-x-1">Code:</h1>
				<Form.Field class="w-full" {form} name="code">
					<Form.Control let:attrs>
						<Input disabled={$submitting} type="number" {...attrs} bind:value={$formData.code} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<input type="hidden" name="secret" bind:value={$formData.secret} />

			<AlertDialog.Footer class="mx-auto">
				<Form.Button disabled={$submitting}>Verify</Form.Button>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
