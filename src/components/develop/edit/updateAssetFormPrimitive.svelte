<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm, fileProxy } from 'sveltekit-superforms'

	import type { FormSchema as AssetSchema } from '$lib/schemas//edit/updateassetschema'

	import { formSchema as assetSchema } from '$lib/schemas/edit/updateassetschema'

	import { defaultClass } from '$src/components/ui/input'
	import { zodClient } from 'sveltekit-superforms/adapters'

	export let data: SuperValidated<Infer<AssetSchema>>

	let form = superForm(data, {
		validators: zodClient(assetSchema)
	})

	const { form: formData, enhance, submitting } = form

	const file = fileProxy(formData, 'asset')

	export let friendlyName: string

	export let fileTypes: string[]
</script>

<form method="POST" enctype="multipart/form-data" class="max-w-4xl" use:enhance>
	<Form.Field {form} name="asset">
		<Form.Control let:attrs>
			<Form.Label>{friendlyName}</Form.Label>
			<input
				class={defaultClass}
				type="file"
				name={attrs.name}
				bind:files={$file}
				accept={fileTypes.toString()}
				disabled={$submitting}
			/>
			<Form.Description
				>{#each fileTypes as fileType}{fileType.toUpperCase()} {' '}{/each} Format
			</Form.Description>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button disabled={$submitting}>Upload</Form.Button>
</form>
