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
	pageName.set('Login')

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { Input } from '$src/components/ui/input'

	export let data: PageData

	const form = superForm(data.form, {
		validators: zodClient(formSchema)
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
			<h1 class="text-2xl font-semibold tracking-tight">Login to Hexagon</h1>
		</div>

		<form method="POST" use:enhance>
			<Form.Field {form} name="username">
				<Form.Control let:attrs>
					<Form.Label>Username</Form.Label>
					<Input
						disabled={$submitting}
						placeholder="(Username)"
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
					<Form.Label>Password</Form.Label>
					<Input
						disabled={$submitting}
						placeholder="(Password)"
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

			<div class="flex flex-row gap-x-2">
				<Form.Button disabled={$submitting} class="w-full">
					{#if $submitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Log in</Form.Button
				>
				<Button href="/" class="block sm:hidden text-center" variant="outline">Sign Up</Button>
			</div>
		</form>

		<p class="px-8 text-center text-sm text-muted-foreground">
			By clicking Log In, you agree to our
			<a href="/terms" class="underline underline-offset-4 hover:text-primary">
				Terms of Service
			</a>
			and
			<a href="/privacy" class="underline underline-offset-4 hover:text-primary">
				Privacy Policy
			</a>
			.
		</p>
	</div>
</div>
