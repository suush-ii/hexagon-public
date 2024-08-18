<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm, fileProxy } from 'sveltekit-superforms'

	import type { FormSchema as PlaceSchema } from '$lib/schemas/placeschema'

	import { formSchema as placeSchema } from '$lib/schemas/placeschema'

	import * as Select from '$src/components/ui/select'

	import { gearAttributesZod as attributes } from '$lib'

	import { BookText } from 'lucide-svelte'
	import * as RadioGroup from '$src/components/ui/radio-group'
	import { Input, defaultClass } from '$src/components/ui/input'
	import { zodClient } from 'sveltekit-superforms/adapters'

	export let data: SuperValidated<Infer<PlaceSchema>>

	let form = superForm(data, {
		validators: zodClient(placeSchema)
	})

	const { form: formData, enhance, submitting, constraints } = form

	const file = fileProxy(formData, 'asset')

	export let friendlyName: string

	export let fileTypes: string[]

	$: allowedGear = $formData.allowedgear.map((c) => ({ label: c, value: c }))

	$: geargenreenforced = 'true'

	$: {
		if (geargenreenforced === 'true') {
			$formData.geargenreenforced = true
		} else {
			$formData.geargenreenforced = false
		}
	}
</script>

<form method="POST" enctype="multipart/form-data" class="max-w-4xl" use:enhance>
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

	<Form.Fieldset {form} name="geargenreenforced" class="space-y-3">
		<Form.Legend>Allowed Genre</Form.Legend>
		<RadioGroup.Root bind:value={geargenreenforced} class="flex flex-col space-y-1">
			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control let:attrs>
					<RadioGroup.Item value="true" {...attrs} />
					<Form.Label class="font-normal">Game Genre</Form.Label>
				</Form.Control>
			</div>
			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control let:attrs>
					<RadioGroup.Item value="false" {...attrs} />
					<Form.Label class="font-normal">All Genres</Form.Label>
				</Form.Control>
			</div>
			<RadioGroup.Input name="geargenreenforced" />
		</RadioGroup.Root>
		<Form.FieldErrors />
	</Form.Fieldset>

	<Form.Field {form} name="allowedgear">
		<Form.Control let:attrs>
			<Form.Label>Gear Types</Form.Label>
			<Select.Root
				multiple
				selected={allowedGear}
				onSelectedChange={(s) => {
					if (s) {
						$formData.allowedgear = s.map((c) => c.value)
					} else {
						$formData.allowedgear = []
					}
				}}
				disabled={$submitting}
			>
				{#each $formData.allowedgear as color}
					<input name={attrs.name} hidden value={color} />
				{/each}
				<Select.Trigger {...attrs}>
					<Select.Value />
				</Select.Trigger>
				<Select.Content>
					{#each attributes as value}
						<Select.Item {value} label={value} />
					{/each}
				</Select.Content>
			</Select.Root>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

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

	<Form.Button disabled={$submitting}>Upload</Form.Button>
</form>
