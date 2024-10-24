<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'

	import type { FormSchema as GamepassSchema } from '$src/lib/schemas/edit/editgamepassschema'

	import { formSchema as gamepassSchema } from '$src/lib/schemas/edit/editgamepassschema'

	import type { FormTextareaEvent } from '$src/components/ui/textarea'
	import { BookText } from 'lucide-svelte'
	import { currencyNamePlural } from '$src/stores'
	import { Input } from '$src/components/ui/input'
	import { Textarea } from '$src/components/ui/textarea'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { page } from '$app/stores'
	import { Checkbox } from '$src/components/ui/checkbox'

	export let data: SuperValidated<Infer<GamepassSchema>>

	let form = superForm(data, {
		validators: zodClient(gamepassSchema),
		resetForm: false
	})

	const { form: formData, enhance, submitting, constraints } = form

	export let friendlyName: string

	export let name: string

	export let price: number

	export let onsale: boolean

	export let description = ''

	function handleUpdate(e: FormTextareaEvent<any>) {
		description = e?.target?.value
	}

	$formData.price = price
	$formData.name = name
	$formData.onsale = onsale
</script>

<form method="POST" action="?/gamepass" enctype="multipart/form-data" class="max-w-4xl" use:enhance>
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

	<Form.Field {form} name="description">
		<Form.Control let:attrs>
			<Form.Label>Description</Form.Label>
			<Textarea
				{...attrs}
				disabled={$submitting}
				on:input={handleUpdate}
				class="resize-none"
				bind:value={$formData.description}
			/>
			<Form.Description>{description.length}/1000 characters</Form.Description>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="onsale">
		<Form.Control let:attrs>
			<Checkbox {...attrs} bind:checked={$formData.onsale} />
			<Form.Label>Sell this Item</Form.Label>

			<input name={attrs.name} value={$formData.onsale} hidden />
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

	<Form.Button disabled={$submitting}>{$page.data.t('develop.save')}</Form.Button>
</form>
