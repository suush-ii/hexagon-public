<script lang="ts">
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Select from '$src/components/ui/select'
	import { formSchema, type FormSchema } from './schema'
	import * as Form from '$src/components/ui/form/index.js'

	import type { PageData, ActionData } from './$types'

	export let data: PageData

	export let form: ActionData

	const generateForm = superForm(data.form, {
		validators: zodClient(formSchema),
		resetForm: false
	})

	const { form: formData, enhance } = generateForm

	$: amount = $formData.amount
		? {
				label: $formData.amount.toString(),
				value: $formData.amount
			}
		: undefined
</script>

<div class="p-8 flex flex-col space-y-4">
	<h1>Generate</h1>

	<form method="POST" class="space-y-6" use:enhance>
		<Form.Field form={generateForm} name="amount">
			<Form.Control let:attrs>
				<Form.Label>Amount</Form.Label>
				<Select.Root
					selected={amount}
					onSelectedChange={(v) => {
						v && ($formData.amount = v.value)
					}}
				>
					<Select.Trigger {...attrs}>
						<Select.Value />
					</Select.Trigger>
					<Select.Content>
						{#each { length: 20 } as _, i}
							<Select.Item value={i + 1} label={(i + 1).toString()} />
						{/each}
					</Select.Content>
				</Select.Root>
				<input hidden bind:value={$formData.amount} type="number" name={attrs.name} />
			</Form.Control>
			<Form.Description>Do not invite hooligans</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Button>Submit</Form.Button>
	</form>

	{#if form?.keys}
		<div class="space-y-4 h-40 overflow-y-auto">
			<h2>Keys</h2>
			<ul class="space-y-2">
				{#each form.keys as key}
					<li>{key}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
