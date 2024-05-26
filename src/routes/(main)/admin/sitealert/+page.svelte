<script lang="ts">
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form/index.js'
	import { formSchema, type FormSchema } from './schema'
	import type { PageData } from './$types'
	import { Input } from '$src/components/ui/input'

	export let data: PageData

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		resetForm: false
	})

	const { form: formData, enhance } = form

	$formData.sitealert = data.config.sitealert
</script>

<div class="p-8 flex flex-col space-y-4 grow max-w-2xl">
	<h1>Config</h1>

	<form method="POST" class="space-y-6 grow" use:enhance>
		<Form.Field {form} name="sitealert">
			<Form.Control let:attrs>
				<Form.Label>Site Alert</Form.Label>
				<Input {...attrs} bind:value={$formData.sitealert} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Button>Submit</Form.Button>
	</form>
</div>
