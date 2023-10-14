<script lang="ts">
	import * as Form from '$src/components/ui/form'
	import { Loader2 } from 'lucide-svelte'
	import { formSchema } from '$lib/schemas/loginschema'
	import Warntext from '$src/components/warntext.svelte'

	import type { PageData } from './$types'

	import { pageName } from '$src/stores'
	pageName.set('Home')

	export let data: PageData

	let form = data.form
</script>

<div class="flex m-auto">
	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="relative mx-auto font-bold z-20 flex items-center text-4xl">
			<h1 class="text-2xl pr-4 mt-auto">Project</h1>
			<img alt="H" class="w-16" src="/hexagon512.png" />
			exagon
		</div>
		<div class="flex flex-col space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Login to Hexagon</h1>
		</div>

		<Form.Root method="POST" {form} schema={formSchema} let:config let:submitting let:message>
			<Form.Field {config} name="username">
				<Form.Item>
					<Form.Label>Username</Form.Label>
					<Form.Input disabled={submitting} placeholder="(Username)" />
					<Form.Validation />
				</Form.Item>
			</Form.Field>

			<Form.Field {config} name="password">
				<Form.Item>
					<Form.Label>Password</Form.Label>
					<Form.Input disabled={submitting} placeholder="(Password)" type="password" />
					<Form.Validation />
					<Form.Description>
						{#if message}<Warntext text={message} />{/if}
					</Form.Description>
				</Form.Item>
			</Form.Field>

			<Form.Button disabled={submitting} class="w-full">
				{#if submitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Log in</Form.Button
			>
		</Form.Root>

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
