<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { type SuperValidated, type Infer, superForm, fileProxy } from 'sveltekit-superforms'

	import type { FormSchema as GameSchema } from '$lib/schemas/edit/game/editimageschema'

	import { formSchema as gameSchema } from '$lib/schemas/edit/game/editimageschema'

	import { defaultClass } from '$src/components/ui/input'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { page } from '$app/stores'

	export let data: SuperValidated<Infer<GameSchema>>

	let form = superForm(data, {
		validators: zodClient(gameSchema)
	})

	const { form: formData, enhance, submitting, message } = form

	const file = fileProxy(formData, 'asset')

	export let friendlyName: string

	export let fileTypes: string[]

	export let type: 'icon' | 'thumbnail'
</script>

<form
	method="POST"
	action="?/gameimage"
	enctype="multipart/form-data"
	class="max-w-4xl"
	use:enhance
>
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

		<Form.Description>
			<h1 class="text-white">All images go through moderation</h1>

			<h1 class="text-white">
				{#if $message}{$message}{/if}
			</h1>
		</Form.Description>
	</Form.Field>

	<input name="type" value={type} hidden />

	<Form.Button disabled={$submitting}>{$page.data.t('develop.save')}</Form.Button>
</form>
