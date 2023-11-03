<script lang="ts">
	import * as Form from '$src/components/ui/form'

	import { formSchema } from '$lib/schemas/gameschema'

	import type { PageData } from './$types'
	import type { FormTextareaEvent } from '$src/components/ui/textarea'
	import * as Avatar from '$src/components/ui/avatar'
	import { BookText } from 'lucide-svelte'

	export let data: PageData

	let form = data.form

	let description = ''

	function handleUpdate(e: FormTextareaEvent<any>) {
		description = e?.target?.value
	}
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Upload {data.friendlyName}</h1>
	<!-- TODO: FORM-->

	<Form.Root class="max-w-4xl" method="POST" {form} schema={formSchema} let:config let:submitting>
		<Form.Field {config} name="gamename">
			<Form.Item>
				<Form.Label>Name</Form.Label>
				<Form.Input disabled={submitting} icon={BookText} />
				<Form.Description>Up to 50 characters.</Form.Description>
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

		<Form.Field {config} name="serversize">
			<Form.Item>
				<Form.Label>Server Size</Form.Label>
				<Form.Input disabled={submitting} type={'number'} min={1} max={50} />
				<Form.Description>Up to 50 players.</Form.Description>
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<Form.Field {config} name="game">
			<Form.Item>
				<Form.Label>Game</Form.Label>
				<Form.Input class="w-fit" disabled={submitting} type={'file'} />
				<Form.Description>.RBXL Format</Form.Description>
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<Form.Button disabled={submitting}>Upload</Form.Button>
	</Form.Root>

	<!-- TODO: Form fields don't support file uploads will have to figure out a way to hack this...-->
</div>
