<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'

	import type { FormSchema as PackageSchema } from '$lib/schemas/packageschema'

	import { formSchema as packageSchema } from '$lib/schemas/packageschema'

	import { currencyNamePlural } from '$src/stores'
	import { Input } from '$src/components/ui/input'
	import { zodClient } from 'sveltekit-superforms/adapters'

	export let data: SuperValidated<Infer<PackageSchema>>

	let form = superForm(data, {
		validators: zodClient(packageSchema)
	})

	const { form: formData, enhance, submitting } = form

	$formData.assetversion = 1
</script>

<form method="POST" action="?/package" enctype="multipart/form-data" class="max-w-4xl" use:enhance>
	<Form.Field {form} name="bundleid">
		<Form.Control let:attrs>
			<Form.Label>Bundle ID</Form.Label>
			<Input
				{...attrs}
				disabled={$submitting}
				type="number"
				min={1}
				bind:value={$formData.bundleid}
			/>
			<Form.Description
				>Copy from URL. Automatically uploads all body parts. Please only "Packages" not Rthro.</Form.Description
			>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="price">
		<Form.Control let:attrs>
			<Form.Label>Price</Form.Label>
			<Input
				{...attrs}
				disabled={$submitting}
				type="number"
				min={0}
				max={999999999}
				bind:value={$formData.price}
			/>
			<Form.Description>Up to 999999999 {currencyNamePlural}.</Form.Description>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="assetversion">
		<Form.Control let:attrs>
			<Form.Label>Asset Version</Form.Label>
			<Input
				{...attrs}
				disabled={$submitting}
				type="number"
				min={1}
				max={100}
				bind:value={$formData.assetversion}
			/>
			<Form.Description>Keep at default.</Form.Description>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button disabled={$submitting}>Upload</Form.Button>
</form>
