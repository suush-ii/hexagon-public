<script lang="ts">
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form/index.js'
	import { Checkbox } from '$src/components/ui/checkbox/index.js'
	import { formSchema } from './schema'
	import type { PageData } from './$types'
	import { Input } from '$src/components/ui/input'

	export let data: PageData

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		resetForm: false
	})

	const { form: formData, enhance, submitting } = form

	$formData.maintenanceEnabled = data.config.maintenanceEnabled
	$formData.registrationEnabled = data.config.registrationEnabled
	$formData.keysEnabled = data.config.keysEnabled
	$formData.gamesEnabled = data.config.gamesEnabled
	$formData.developEnabled = data.config.developEnabled
	$formData.applicationsEnabled = data.config.applicationsEnabled
	$formData.coneHat = data.coneHat?.awardid
	$formData.jamrioHat = data.jamrioHat?.awardid
	$formData.wuffHat = data.wuffHat?.awardid
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

		<Form.Field
			{form}
			name="applicationsEnabled"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Checkbox {...attrs} bind:checked={$formData.applicationsEnabled} />
				<div class="space-y-1 leading-none">
					<Form.Label>Applications</Form.Label>
				</div>
				<input name={attrs.name} value={$formData.applicationsEnabled} hidden />
			</Form.Control>
		</Form.Field>

		<Form.Field
			{form}
			name="coneHat"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Form.Label>Hat for cone clan to reward:</Form.Label>
				<Input
					placeholder="None"
					disabled={$submitting}
					{...attrs}
					bind:value={$formData.coneHat}
					type="number"
				/>

				<Form.FieldErrors />
			</Form.Control>
		</Form.Field>

		<Form.Field
			{form}
			name="jamrioHat"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Form.Label>Hat for jamrio clan to reward:</Form.Label>
				<Input
					placeholder="None"
					disabled={$submitting}
					{...attrs}
					bind:value={$formData.jamrioHat}
					type="number"
				/>

				<Form.FieldErrors />
			</Form.Control>
		</Form.Field>

		<Form.Field
			{form}
			name="wuffHat"
			class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
		>
			<Form.Control let:attrs>
				<Form.Label>Hat for wuff clan to reward:</Form.Label>
				<Input
					placeholder="None"
					disabled={$submitting}
					{...attrs}
					bind:value={$formData.wuffHat}
					type="number"
				/>

				<Form.FieldErrors />
			</Form.Control>
		</Form.Field>

		<Form.Button>Submit</Form.Button>
	</form>
</div>
