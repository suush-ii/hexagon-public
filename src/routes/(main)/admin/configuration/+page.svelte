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

	$formData.maintenanceEnabled = data.config.maintenanceEnabled
	$formData.registrationEnabled = data.config.registrationEnabled
	$formData.keysEnabled = data.config.keysEnabled
	$formData.gamesEnabled = data.config.gamesEnabled
	$formData.developEnabled = data.config.developEnabled
</script>

<div class="p-8 flex flex-col space-y-4">
	<h1>Config</h1>

	<form method="POST" class="space-y-6" use:enhance>
		<Form.Field
			{form}
			name="maintenanceEnabled"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Checkbox {...attrs} bind:checked={$formData.maintenanceEnabled} />
				<div class="space-y-1 leading-none">
					<Form.Label>Maintenance</Form.Label>
				</div>
				<input name={attrs.name} value={$formData.maintenanceEnabled} hidden />
			</Form.Control>
		</Form.Field>

		<Form.Field
			{form}
			name="registrationEnabled"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Checkbox {...attrs} bind:checked={$formData.registrationEnabled} />
				<div class="space-y-1 leading-none">
					<Form.Label>Registration</Form.Label>
				</div>
				<input name={attrs.name} value={$formData.registrationEnabled} hidden />
			</Form.Control>
		</Form.Field>

		<Form.Field
			{form}
			name="keysEnabled"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Checkbox {...attrs} bind:checked={$formData.keysEnabled} />
				<div class="space-y-1 leading-none">
					<Form.Label>Keys</Form.Label>
				</div>
				<input name={attrs.name} value={$formData.keysEnabled} hidden />
			</Form.Control>
		</Form.Field>

		<Form.Field
			{form}
			name="gamesEnabled"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Checkbox {...attrs} bind:checked={$formData.gamesEnabled} />
				<div class="space-y-1 leading-none">
					<Form.Label>Games</Form.Label>
				</div>
				<input name={attrs.name} value={$formData.gamesEnabled} hidden />
			</Form.Control>
		</Form.Field>

		<Form.Field
			{form}
			name="developEnabled"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Checkbox {...attrs} bind:checked={$formData.developEnabled} />
				<div class="space-y-1 leading-none">
					<Form.Label>Develop</Form.Label>
				</div>
				<input name={attrs.name} value={$formData.developEnabled} hidden />
			</Form.Control>
		</Form.Field>
		<Form.Button>Submit</Form.Button>
	</form>
</div>
