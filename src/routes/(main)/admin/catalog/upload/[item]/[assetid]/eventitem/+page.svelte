<script lang="ts">
	import type { PageData } from './$types'
	import * as Form from '$src/components/ui/form/index.js'
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { formSchema } from '$lib/schemas/edit/admin/eventitemschema'
	import { Input } from '$src/components/ui/input'

	export let data: PageData

	const form = superForm(data.eventItemForm, {
		validators: zodClient(formSchema),
		resetForm: false
	})

	const { form: formData, enhance, submitting } = form

	$formData.assetid = data.eventItem?.awardid
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">
		Configure {data.friendlyName}
	</h1>

	<form method="POST" class="max-w-4xl" use:enhance>
		<Form.Field {form} name="assetid" class="max-w-xl">
			<Form.Control let:attrs>
				<Form.Label>Assetid to reward:</Form.Label>
				<Input
					placeholder="None"
					disabled={$submitting}
					{...attrs}
					bind:value={$formData.assetid}
					type="number"
				/>

				<Form.FieldErrors />
			</Form.Control>
		</Form.Field>

		<Form.Button variant="outline">Submit</Form.Button>
	</form>
</div>
