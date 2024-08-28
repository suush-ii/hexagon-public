<script lang="ts">
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form/index.js'
	import { Checkbox } from '$src/components/ui/checkbox/index.js'
	import { formSchema, type FormSchema } from './schema'
	import type { PageData } from './$types'

	export let data: PageData

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		resetForm: false
	})

	const { form: formData, enhance } = form
</script>

<div class="p-8 flex flex-col space-y-4">
	<h1>Moderate</h1>

	<form method="POST" class="space-y-6" use:enhance>
		<Form.Field
			{form}
			name="scrubassetname"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Checkbox {...attrs} bind:checked={$formData.scrubassetname} />
				<div class="space-y-1 leading-none">
					<Form.Label>Scrub Name</Form.Label>
				</div>
				<input name={attrs.name} value={$formData.scrubassetname} hidden />
			</Form.Control>
		</Form.Field>

		<Form.Button variant="outline">Submit</Form.Button>
	</form>
</div>
