<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { Separator } from '$src/components/ui/separator'
	import { Input } from '$src/components/ui/input'
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms'
	import { type FormSchema, formSchema } from '$src/lib/schemas/2faschema'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form'

	export let _2faForm: SuperValidated<Infer<FormSchema>>

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
	}
</script>

<AlertDialog.Root closeOnOutsideClick={true} bind:open={open2fa}>
	<AlertDialog.Content class="space-y-2">
		<form method="POST" class="space-y-2 flex flex-col" action="?/_2fadisable" use:enhance>
			<AlertDialog.Header class="space-y-6">
				<AlertDialog.Title class="text-xl font-semibold">
					Disable 2FA
					<Separator />
				</AlertDialog.Title>
			</AlertDialog.Header>

			<div class="flex flex-col mx-auto w-full">
				<h1 class="flex items-center gap-x-1">Code:</h1>
				<Form.Field class="w-full" {form} name="code">
					<Form.Control let:attrs>
						<Input disabled={$submitting} type="number" {...attrs} bind:value={$formData.code} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<AlertDialog.Footer class="mx-auto">
				<Form.Button disabled={$submitting}>Disable</Form.Button>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
