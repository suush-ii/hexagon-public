<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm, fileProxy } from 'sveltekit-superforms'

	import type { FormSchema as GameSchema } from '$lib/schemas/gameschema'

	import { formSchema as gameSchema } from '$lib/schemas/gameschema'

	import * as Select from '$src/components/ui/select'

	import { gameGenreZod as genres } from '$lib'

	import type { FormTextareaEvent } from '$src/components/ui/textarea'
	import { BookText } from 'lucide-svelte'
	import { Input, defaultClass } from '$src/components/ui/input'
	import { Textarea } from '$src/components/ui/textarea'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import SuperDebug from 'sveltekit-superforms'

	export let data: SuperValidated<Infer<GameSchema>>

	let form = superForm(data, {
		validators: zodClient(gameSchema)
	})

	const { form: formData, enhance, submitting, constraints } = form

	const file = fileProxy(formData, 'asset')

	export let friendlyName: string

	export let fileTypes: string[]

	let description = ''

	function handleUpdate(e: FormTextareaEvent<any>) {
		description = e?.target?.value
	}

	$: selectedGenre = $formData.genre
		? {
				label: genres[$formData.genre],
				value: $formData.genre
			}
		: undefined
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
