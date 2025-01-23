<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'

	import type { FormSchema as GameSchema } from '$lib/schemas/edit/editgameschema'

	import { formSchema as gameSchema } from '$lib/schemas/edit/editgameschema'

	import * as Select from '$src/components/ui/select'

	import { assetGenreZod as genres, clientVersionsZod } from '$lib'

	import type { FormTextareaEvent } from '$src/components/ui/textarea'
	import { BookText } from 'lucide-svelte'
	import { Input } from '$src/components/ui/input'
	import { Textarea } from '$src/components/ui/textarea'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import type { AssetGenreDB, clientVersions } from '$src/lib/types'
	import { page } from '$app/stores'

	export let data: SuperValidated<Infer<GameSchema>>

	let form = superForm(data, {
		validators: zodClient(gameSchema),
		resetForm: false
	})

	const { form: formData, enhance, submitting, constraints } = form

	export let friendlyName: string

	export let name: string

	export let description = ''

	export let serversize: number

	export let genre: AssetGenreDB

	export let clientversion: clientVersions

	function handleUpdate(e: FormTextareaEvent<any>) {
		description = e?.target?.value
	}

	$: selectedGenre = $formData.genre
		? {
				label: $formData.genre,
				value: $formData.genre
			}
		: undefined

	$: selectedClientVersion = $formData.clientversion
		? { label: $formData.clientversion, value: $formData.clientversion }
		: undefined

	$formData.name = name
	$formData.description = description
	$formData.serversize = serversize
	$formData.genre = genre
	$formData.clientversion = clientversion
</script>

<form method="POST" action="?/game" enctype="multipart/form-data" class="max-w-4xl" use:enhance>
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

	<Form.Field {form} name="serversize">
		<Form.Control let:attrs>
			<Form.Label>Server Size</Form.Label>
			<Input
				disabled={$submitting}
				type="number"
				min={0}
				max={50}
				{...attrs}
				bind:value={$formData.serversize}
			/>
			<Form.Description>Up to 50 players.</Form.Description>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="genre">
		<Form.Control let:attrs>
			<Form.Label>Genre</Form.Label>
			<Select.Root
				selected={selectedGenre}
				onSelectedChange={(v) => {
					v && ($formData.genre = v.value)
				}}
				disabled={$submitting}
			>
				<Select.Trigger {...attrs}>
					<Select.Value />
				</Select.Trigger>
				<Select.Content>
					{#each genres as value}
						<Select.Item {value} label={value} />
					{/each}
				</Select.Content>
			</Select.Root>
			<input hidden bind:value={$formData.genre} name={attrs.name} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button disabled={$submitting}>{$page.data.t('develop.save')}</Form.Button>
</form>
