<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm, fileProxy } from 'sveltekit-superforms'

	import type { FormSchema as UserAdSchema } from '$lib/schemas/useradschema'

	import { formSchema as userAdSchema } from '$lib/schemas/useradschema'

	import { BookText } from 'lucide-svelte'
	import { Input, defaultClass } from '$src/components/ui/input'
	import { zodClient } from 'sveltekit-superforms/adapters'

	export let data: SuperValidated<Infer<UserAdSchema>>

	let form = superForm(data, {
		validators: zodClient(userAdSchema)
	})

	const { form: formData, enhance, submitting, constraints } = form

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
				>{#each fileTypes as fileType}{fileType.toUpperCase()} {' '}{/each} Format 10MB Max
			</Form.Description>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

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

	<Form.Button disabled={$submitting}>Upload</Form.Button>
</form>
