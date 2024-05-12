<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	import { pageName } from '$src/stores'
	pageName.set('Not Approved')

	import { Checkbox } from '$src/components/ui/checkbox'
	import { Label } from '$src/components/ui/label'

	import * as Form from '$src/components/ui/form'

	import { enhance } from '$app/forms'

	let checked = false
</script>

<div
	class="flex flex-col space-y-12 m-auto supports-backdrop-blur:bg-background/60 border-b bg-background/60 p-4 sm:p-16 shadow-sm rounded-xl max-w-2xl"
>
	<h1 class="text-2xl">{data.ban.action}</h1>

	<div class="flex flex-col gap-y-4">
		<h1 class="text-lg text-muted-foreground">
			Our content moderators have reviewed your account and found it to be in violation of our
			community guidelines.
		</h1>
		<h1 class="text-lg text-muted-foreground">
			Reviewed: <span class="text-primary"
				>{data.ban.time.toLocaleDateString('en-US')}
				{data.ban.time.toLocaleTimeString('en-US')}</span
			>
		</h1>
		<h1 class="text-lg text-muted-foreground whitespace-pre">
			Moderator Note: <span class="text-primary">{data.ban.note}</span>
		</h1>

		<h1 class="text-lg text-muted-foreground">
			Please abide by Hexagon community guidelines so that Hexagon can be fun for users of all ages.
		</h1>
		{#if data.expired}
			<h1 class="text-lg text-muted-foreground">
				You may reactivate your account by agreeing to our terms of service.
			</h1>

			<div class="flex items-center space-x-2 mx-auto">
				<Checkbox id="terms" bind:checked aria-labelledby="terms-label" />
				<Label
					id="terms-label"
					for="terms"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					I agree
				</Label>
			</div>

			<form method="POST" class="mx-auto mt-4" use:enhance>
				<Form.Button disabled={!checked}>Re-activate My Account</Form.Button>
			</form>
		{/if}
	</div>
</div>
