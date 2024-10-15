<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import Avatar from '$src/components/catalog/avatar.svelte'
	import { Separator } from '../../ui/separator'
	import { MoonStar } from 'lucide-svelte'
	import { Input } from '$src/components/ui/input'
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms'
	import { type FormSchema, formSchema } from '$lib/schemas/catalog/selllimitedschema'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form'

	export let sellFormLimited: SuperValidated<Infer<FormSchema>>

	let form = superForm(sellFormLimited, {
		validators: zodClient(formSchema),
		onResult: async (result) => {
			if (result.result.type === 'success') {
				openSell = false
			}
		}
	})

	const { form: formData, enhance, submitting } = form

	export let itemid: number

	let openSell = false

	export function open() {
		openSell = true
	}
</script>

<AlertDialog.Root closeOnOutsideClick={true} bind:open={openSell}>
	<AlertDialog.Content class="space-y-2">
		<form method="POST" class="space-y-2 flex flex-col" action="?/selllimited" use:enhance>
			<AlertDialog.Header class="space-y-6">
				<AlertDialog.Title class="text-xl font-semibold">
					Sell Your Collectible Item
					<Separator />
				</AlertDialog.Title>
			</AlertDialog.Header>
			<div class="flex gap-x-4">
				<Avatar
					css="aspect-square w-40 rounded-xl"
					itemId={itemid}
					itemName={''}
					disable3d={true}
				/>

				<div class="flex flex-col">
					<h1 class="flex items-center gap-x-1">Price (minimum 1):</h1>
					<Form.Field class="w-full" {form} name="price">
						<Form.Control let:attrs>
							<Input
								disabled={$submitting}
								icon={MoonStar}
								direction="r"
								type="number"
								{...attrs}
								bind:value={$formData.price}
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
			<AlertDialog.Footer class="mx-auto">
				<Form.Button disabled={$submitting}>Sell Now</Form.Button>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
