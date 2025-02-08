<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { Loader2 } from 'lucide-svelte'
	import { formSchema } from '$lib/schemas/loginschema'
	import Warntext from '$src/components/warntext.svelte'

	import { UserSquare2 } from 'lucide-svelte'
	import { Key } from 'lucide-svelte'

	import type { PageData } from './$types'

	import { pageName } from '$src/stores'
	import { Button } from '$src/components/ui/button'
	import { interpolate } from '$lib/poly-i18n/interpolate'
	import M_2FALoginModal from '$src/components/_2FALoginModal.svelte'

	let _2FALoginModal: M_2FALoginModal

	export let data: PageData

	pageName.set(data.t('signUpLogin.logIn'))

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { Input } from '$src/components/ui/input'

	let form = superForm(data.form, {
		validators: zodClient(formSchema),
		onError({ result }) {
			if (result.error.message === '2fa_required') {
				_2FALoginModal.open()
			}
		},
		resetForm: false
	})

	const { form: formData, enhance, submitting, message } = form
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap&text=ProjectHexagon"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex m-auto">
	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="relative mx-auto font-logo z-20 flex items-center text-4xl">
			<h1 class="text-2xl pr-4 mt-auto flex flex-row">Project</h1>
			<img alt="H" class="w-16" src="/hexagon512.png" />
			exagon
		</div>
		<div class="flex flex-col space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">{data.t('signUpLogin.loginText')}</h1>
		</div>

		<form method="POST" use:enhance>
			<Form.Field {form} name="username">
				<Form.Control let:attrs>
					<Form.Label>{data.t('signUpLogin.username')}</Form.Label>
					<Input
						disabled={$submitting}
						placeholder={`(${data.t('signUpLogin.username')})`}
						direction="r"
						icon={UserSquare2}
						{...attrs}
						bind:value={$formData.username}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Form.Label>{data.t('signUpLogin.password')}</Form.Label>
					<Input
						disabled={$submitting}
						placeholder={`(${data.t('signUpLogin.password')})`}
						type="password"
						direction="r"
						icon={Key}
						{...attrs}
						bind:value={$formData.password}
					/>
					<Form.Description>
						{#if $message}<Warntext text={$message} />{/if}
					</Form.Description>
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>

			<input type="hidden" name="_2facode" bind:value={$formData._2facode} />

			<div class="flex flex-row gap-x-2">
				<Form.Button disabled={$submitting} class="w-full">
					{#if $submitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					{data.t('signUpLogin.logIn')}</Form.Button
				>
				<Button href="/" class="block sm:hidden text-center" variant="outline"
					>{data.t('signUpLogin.signUp')}</Button
				>
			</div>
		</form>

		<p class="px-8 text-center text-sm text-muted-foreground">
			{@html interpolate(data.t('signUpLogin.agreement'), {
				button: data.t('signUpLogin.logIn'),
				terms: `<a href="/legal/terms" class="underline underline-offset-4 hover:text-primary">${data.t('signUpLogin.terms')}</a>`,
				privacy: `<a href="/legal/privacy" class="underline underline-offset-4 hover:text-primary">${data.t('signUpLogin.privacy')}</a>`
			})}
		</p>
	</div>
</div>

<M_2FALoginModal bind:this={_2FALoginModal} bind:_2faForm={form} />
