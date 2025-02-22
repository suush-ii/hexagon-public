<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { Loader2 } from 'lucide-svelte'
	import { formSchema } from '$lib/schemas/applicationschema'
	import Warntext from '$src/components/warntext.svelte'
	import { localStorageStore } from '$src/stores'

	import { UserSquare2 } from 'lucide-svelte'
	import { Key } from 'lucide-svelte'

	import type { PageData } from './$types'

	import { pageName } from '$src/stores'
	import { Button } from '$src/components/ui/button'
	import { interpolate } from '$lib/poly-i18n/interpolate'

	export let data: PageData

	pageName.set('Applications')

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { Input } from '$src/components/ui/input'
	import type { Writable } from 'svelte/store'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'

	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	})

	const { form: formData, enhance, submitting, message } = form

	if (browser) {
		let applicationid = localStorage?.getItem('applicationid') ?? ''

		goto(`/applications/${applicationid}`)
	}
</script>

<div class="flex m-auto">
	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="relative mx-auto z-20 flex items-center text-4xl">
			<h1 class="text-2xl pr-4 mt-auto flex flex-row">Application Status</h1>
		</div>

		<div class="flex flex-col space-y-2 text-center">
			<p class="text-sm text-muted-foreground">
				If you have previously submitted an application and have the ID please submit here.
			</p>
		</div>

		<form method="POST" class="space-y-4" use:enhance>
			<Form.Field {form} name="applicationid">
				<Form.Control let:attrs>
					<Input
						disabled={$submitting}
						placeholder={'Application ID'}
						direction="r"
						icon={UserSquare2}
						{...attrs}
						bind:value={$formData.applicationid}
					/>
				</Form.Control>
				<Form.FieldErrors />

				<Form.Description>
					{#if $message}<Warntext text={$message} />{/if}
				</Form.Description>
			</Form.Field>

			<div class="flex flex-row gap-x-2">
				<Form.Button disabled={$submitting} class="w-full">
					{#if $submitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Submit</Form.Button
				>
			</div>
		</form>
	</div>
</div>
