<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'

	import type { FormSchema as UserAdSchema } from '$src/lib/schemas/edit/edituseradschema'

	import { formSchema as userAdSchema } from '$src/lib/schemas/edit/edituseradschema'
	import { BookText } from 'lucide-svelte'
	import { Input } from '$src/components/ui/input'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { page } from '$app/stores'

	export let data: SuperValidated<Infer<UserAdSchema>>

	let form = superForm(data, {
		validators: zodClient(userAdSchema),
		resetForm: false
	})

	const { form: formData, enhance, submitting, constraints } = form

	export let friendlyName: string

	export let name: string

	$formData.name = name
</script>

<form method="POST" action="?/userad" enctype="multipart/form-data" class="max-w-4xl" use:enhance>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>{friendlyName} Name</Form.Label>
			<Input
				disabled={$submitting}
				icon={BookText}
				direction="r"
				{...attrs}
				bind:value={$formData.name}
			/>
			<Form.Description>Up to {$constraints.name?.maxlength} characters.</Form.Description>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button disabled={$submitting}>{$page.data.t('develop.save')}</Form.Button>
</form>
