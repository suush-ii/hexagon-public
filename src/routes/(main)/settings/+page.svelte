<script lang="ts">
	import * as Select from '$src/components/ui/select/index.js'
	import { themes } from '$lib/themes'
	import { browser } from '$app/environment'
	import { Textarea } from '$src/components/ui/textarea'
	import { Button } from '$src/components/ui/button'
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { formSchema } from '$lib/schemas/settingsschema'
	import type { PageData } from './$types'
	import * as Form from '$src/components/ui/form'

	export let data: PageData

	let linkForm: HTMLFormElement,
		discordLinkDisabled = false,
		discordToken = ''

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		resetForm: false
	})

	const { form: formData, enhance, submitting } = form

	let current_theme = ''
	if (browser) {
		const theme = window.localStorage.getItem('theme')
		if (theme && themes.includes(theme)) {
			document.documentElement.setAttribute('class', theme)
			current_theme = theme
		}
	}

	function set_theme() {
		const theme = selected.value
		if (themes.includes(theme)) {
			const one_year = 60 * 60 * 24 * 365
			window.localStorage.setItem('theme', theme)
			document.cookie = `theme=${theme}; max-age=${one_year}; path=/;`
			document.documentElement.setAttribute('class', theme)
			current_theme = theme
		}
	}

	$: selected = {
		value: current_theme,
		label: current_theme
	}

	$: selected, set_theme()

	function discord(form: HTMLFormElement) {
		discordLinkDisabled = true

		const params =
			'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,\n' +
			'width=600,height=900,left=50%,top=50%'
		const popup = window.open(data.discordAuth.url, 'Discord Auth', params)

		const interval = setInterval(() => {
			if (!popup) return
			popup.postMessage('', '*')
		}, 500)

		window.addEventListener(
			'message',
			(event) => {
				console.log(event.data)

				if (event.data.code && popup) {
					clearInterval(interval)
					popup.close()
					discordToken = event.data.code
					setTimeout(() => {
						form.submit()
					}, 500)
				}
			},
			false
		)
	}

	$formData.blurb = data.blurb
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">My Settings</h1>

	<h2 class="text-lg font-semibold">Account Settings</h2>

	<table class="table-fixed">
		<tbody>
			<tr>
				<td class="w-32">Password:</td>
				<td>********** <Button variant="outline" size="sm">Change Password</Button></td>
			</tr>
			<tr>
				<td class="w-32">Discord:</td>
				{#if data.discordId}
					<td>Linked</td>
				{:else}
					<td>
						None
						<Button
							disabled={discordLinkDisabled}
							on:click={() => {
								discord(linkForm)
							}}
							variant="outline"
							size="sm">Link Discord</Button
						>
					</td>
				{/if}
			</tr>
		</tbody>
	</table>

	<h2 class="text-lg font-semibold mt-4">Other Settings</h2>

	<form method="POST" action="?/other" class="w-full" use:enhance>
		<table class="table-fixed border-separate border-spacing-y-4 w-full">
			<tbody>
				<tr>
					<td class="w-32">Theme:</td>
					<td
						><Select.Root bind:selected>
							<Select.Trigger class="w-[180px]">
								<Select.Value />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each themes as theme}
										<Select.Item value={theme} label={theme}>{theme}</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
							<Select.Input name="favoriteFruit" />
						</Select.Root></td
					>
				</tr>
				<tr>
					<td>Blurb:</td>
					<td>
						<Form.Field {form} name="blurb">
							<Form.Control let:attrs>
								<Textarea
									{...attrs}
									placeholder={'No personal info please (1000 character limit)'}
									maxlength={1000}
									disabled={$submitting}
									bind:value={$formData.blurb}
								/>
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field></td
					>
				</tr>
			</tbody>
		</table>

		<Form.Button disabled={$submitting}>{data.t('develop.save')}</Form.Button>
	</form>
</div>

<form action="?/link" method="post" bind:this={linkForm}>
	<input type="hidden" name="code" bind:value={discordToken} />
</form>
