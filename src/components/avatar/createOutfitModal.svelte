<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { Separator } from '$src/components/ui/separator'
	import { Input } from '$src/components/ui/input'
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms'
	import { type FormSchema, formSchema } from '$lib/schemas/avatar/outfit'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form'

	export let createOutfitForm: SuperValidated<Infer<FormSchema>>

	let form = superForm(createOutfitForm, {
		validators: zodClient(formSchema),
		onResult: async (result) => {
			if (result.result.type === 'success') {
				openOutfit = false
			}
		}
	})

	const { form: formData, enhance, submitting } = form

	let openOutfit = false

	export function open() {
		openOutfit = true
	}
</script>

<AlertDialog.Root closeOnOutsideClick={true} bind:open={openOutfit}>
	<AlertDialog.Content class="space-y-2">
		<form method="POST" class="space-y-2 flex flex-col" action="?/outfits" use:enhance>
			<AlertDialog.Header class="space-y-6">
				<AlertDialog.Title class="text-xl font-semibold">
					Create An Outfit
					<Separator />
				</AlertDialog.Title>
			</AlertDialog.Header>
			<div class="flex gap-x-4">
				<div class="flex flex-col">
					<h1 class="flex items-center gap-x-1">Name:</h1>
					<Form.Field class="w-full" {form} name="outfitname">
						<Form.Control let:attrs>
							<Input disabled={$submitting} {...attrs} bind:value={$formData.outfitname} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
			<AlertDialog.Footer class="mx-auto">
				<Form.Button disabled={$submitting}>Create</Form.Button>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
