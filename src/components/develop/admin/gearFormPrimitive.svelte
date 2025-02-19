<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm, fileProxy } from 'sveltekit-superforms'

	import type { FormSchema as GearSchema } from '$lib/schemas/admin/gearschema'

	import { formSchema as gearSchema } from '$lib/schemas/admin/gearschema'

	import type { FormTextareaEvent } from '$src/components/ui/textarea'
	import { BookText } from 'lucide-svelte'
	import { currencyNamePlural } from '$src/stores'
	import { Input, defaultClass } from '$src/components/ui/input'
	import { Textarea } from '$src/components/ui/textarea'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Select from '$src/components/ui/select'

	import { assetGenreZod as genres } from '$lib'

	import { gearAttributesZod as attributes } from '$lib'

	export let data: SuperValidated<Infer<GearSchema>>

	let form = superForm(data, {
		validators: zodClient(gearSchema)
	})

	const { form: formData, enhance, submitting, constraints } = form

	const file = fileProxy(formData, 'asset')

	export let friendlyName: string

	export let fileTypes: string[]

	let description = ''

	function handleUpdate(e: FormTextareaEvent<any>) {
		description = e?.target?.value
	}

	$: selectedGenre = $formData.genres.map((c) => ({ label: c, value: c }))

	$: selectedAttributes = $formData.gearattributes.map((c) => ({ label: c, value: c }))
</script>

<form method="POST" action="?/gear" enctype="multipart/form-data" class="max-w-4xl" use:enhance>
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

	<Form.Field {form} name="genres">
		<Form.Control let:attrs>
			<Form.Label>Genres</Form.Label>
			<Select.Root
				multiple
				selected={selectedGenre}
				onSelectedChange={(s) => {
					if (s) {
						$formData.genres = s.map((c) => c.value)
					} else {
						$formData.genres = []
					}
				}}
				disabled={$submitting}
			>
				{#each $formData.genres as color}
					<input name={attrs.name} hidden value={color} />
				{/each}
				<Select.Trigger {...attrs}>
					<Select.Value />
				</Select.Trigger>
				<Select.Content>
					{#each genres as value}
						<Select.Item {value} label={value} />
					{/each}
				</Select.Content>
			</Select.Root>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="gearattributes">
		<Form.Control let:attrs>
			<Form.Label>Gear Attributes</Form.Label>
			<Select.Root
				multiple
				selected={selectedAttributes}
				onSelectedChange={(s) => {
					if (s) {
						$formData.gearattributes = s.map((c) => c.value)
					} else {
						$formData.gearattributes = []
					}
				}}
				disabled={$submitting}
			>
				{#each $formData.gearattributes as color}
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

	<Form.Field {form} name="stock">
		<Form.Control let:attrs>
			<Form.Label>Stock (Limited U)</Form.Label>
			<Input
				{...attrs}
				disabled={$submitting}
				type="number"
				min={0}
				max={10000}
				bind:value={$formData.stock}
			/>
			<Form.Description>Up to 10000. Leave at 0 to ignore.</Form.Description>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="stocklimit">
		<Form.Control let:attrs>
			<Form.Label>Purchase Limit (Per Person)</Form.Label>
			<Input
				{...attrs}
				disabled={$submitting}
				type="number"
				min={0}
				max={10000}
				bind:value={$formData.stocklimit}
			/>
			<Form.Description>Up to 10000. Leave at 0 to ignore.</Form.Description>
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
				>{#each fileTypes as fileType}{fileType.toUpperCase()} {' '}{/each} Format
			</Form.Description>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button disabled={$submitting}>Upload</Form.Button>
</form>
