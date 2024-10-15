<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'

	import type { FormSchema as GearSchema } from '$lib/schemas/edit/admin/editgearschema'

	import { formSchema as gearSchema } from '$lib/schemas/edit/admin/editgearschema'

	import type { FormTextareaEvent } from '$src/components/ui/textarea'
	import { BookText } from 'lucide-svelte'
	import { currencyNamePlural } from '$src/stores'
	import { Input } from '$src/components/ui/input'
	import { Textarea } from '$src/components/ui/textarea'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Select from '$src/components/ui/select'

	import { assetGenreZod } from '$lib'

	import { gearAttributesZod as attributes } from '$lib'
	import type { AssetGenreDB, GearAttributes } from '$src/lib/types'
	import { Checkbox } from '$src/components/ui/checkbox'
	import { page } from '$app/stores'

	export let data: SuperValidated<Infer<GearSchema>>

	let form = superForm(data, {
		validators: zodClient(gearSchema),
		resetForm: false
	})

	const { form: formData, enhance, submitting, constraints } = form

	export let friendlyName: string

	export let name: string

	export let description = ''

	export let onsale: boolean

	export let price: number

	export let genres: AssetGenreDB[]

	export let gearattributes: GearAttributes[]

    export let limited: boolean

	function handleUpdate(e: FormTextareaEvent<any>) {
		description = e?.target?.value
	}

	$: selectedGenre = $formData.genres.map((c) => ({ label: c, value: c }))

	$: selectedAttributes = $formData.gearattributes.map((c) => ({ label: c, value: c }))

	$formData.name = name
	$formData.description = description
	$formData.onsale = onsale
	$formData.price = price
	$formData.genres = genres
	$formData.gearattributes = gearattributes
    $formData.limited = limited
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

	<Form.Field {form} name="onsale">
		<Form.Control let:attrs>
			<Checkbox {...attrs} bind:checked={$formData.onsale} />
			<Form.Label>Sell this Item</Form.Label>

			<input name={attrs.name} value={$formData.onsale} hidden />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

    <Form.Field {form} name="limited">
		<Form.Control let:attrs>
			<Checkbox disabled={limited} {...attrs} bind:checked={$formData.limited} />
			<Form.Label>Limited (Non Unique) (PERMANENT)</Form.Label>

			<input name={attrs.name} value={$formData.limited} hidden />
		</Form.Control>
		<Form.FieldErrors />
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
					{#each assetGenreZod as value}
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

	<Form.Button disabled={$submitting}>{$page.data.t('develop.save')}</Form.Button>
</form>
