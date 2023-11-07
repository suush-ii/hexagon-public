<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import type { SuperValidated } from 'sveltekit-superforms'

	import type { FormSchema as GameSchema } from '$lib/schemas/gameschema'

	import type { FormSchema as ClothingSchema } from '$lib/schemas/clothingschema'

	import type { FormSchema as AssetSchema } from '$lib/schemas/assetschema'

	export let formSchema: GameSchema | ClothingSchema | AssetSchema

	export let form: SuperValidated<typeof formSchema>

	export let item: string

	import type { FormTextareaEvent } from '$src/components/ui/textarea'
	import { BookText } from 'lucide-svelte'

	export let friendlyName: string

	export let fileTypes: string[]

	let description = ''

	function handleUpdate(e: FormTextareaEvent<any>) {
		description = e?.target?.value
	}
</script>

<Form.Root class="max-w-4xl" method="POST" {form} schema={formSchema} let:config let:submitting>
	<Form.Field {config} name="name">
		<Form.Item>
			<Form.Label>{friendlyName} Name</Form.Label>
			<Form.Input disabled={submitting} icon={BookText} />
			<Form.Description>Up to {config.schema.shape.name.maxLength} characters.</Form.Description>
			<Form.Validation />
		</Form.Item>
	</Form.Field>

	<Form.Field {config} name="description">
		<Form.Item>
			<Form.Label>Description</Form.Label>
			<Form.Textarea disabled={submitting} on:input={handleUpdate} class="resize-none" />
			<Form.Description>{description.length}/1000 characters</Form.Description>
			<Form.Validation />
		</Form.Item>
	</Form.Field>

	{#if item === 'games'}
		<Form.Field {config} name="serversize">
			<Form.Item>
				<Form.Label>Server Size</Form.Label>
				<Form.Input disabled={submitting} type={'number'} min={1} max={50} />
				<Form.Description>Up to 50 players.</Form.Description>
				<Form.Validation />
			</Form.Item>
		</Form.Field>
	{/if}

	<Form.Field
		{config}
		name={item === 'games'
			? 'game'
			: item === 'audio' || item === 'decals'
			? 'asset'
			: item === 'shirts' || item === 'pants'
			? 'clothing'
			: 'clothing'}
	>
		<Form.Item>
			<Form.Label>{friendlyName}</Form.Label>
			<Form.Input class="w-fit" disabled={submitting} accept={fileTypes.toString()} type={'file'} />
			<Form.Description
				>{#each fileTypes as fileType}{fileType.toUpperCase()} {' '}{/each} Format</Form.Description
			>
			<Form.Validation />
		</Form.Item>
	</Form.Field>

	<Form.Button disabled={submitting}>Upload</Form.Button>
</Form.Root>
