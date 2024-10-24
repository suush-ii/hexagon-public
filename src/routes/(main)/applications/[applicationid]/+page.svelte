<script lang="ts">
	import type { PageData } from './$types'

	import { pageName } from '$src/stores'
	import { Button } from '$src/components/ui/button'
	import { localStorageStore } from '$src/stores'
	import type { Writable } from 'svelte/store'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { env } from '$env/dynamic/public'
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { formSchemaDiscord } from '$lib/schemas/settingsschema'

	export let data: PageData

	pageName.set('Applications')

	let discordLinkDisabled = false

	const form = superForm(data.form, {
		validators: zodClient(formSchemaDiscord)
	})

	const { form: formData, enhance, submitting, message } = form

	function discord() {
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
					$formData.code = event.data.code
					setTimeout(() => {
						form.submit()
					}, 500)
				}
			},
			false
		)
	}

	let applicationid: Writable<string>

	if (browser) {
		applicationid = localStorageStore('applicationid', data.applicationid)

		if (data.reviewed && data.accepted === true) {
			setTimeout(() => {
				goto('/?application=' + data.applicationid)
			}, 3000)
		}
	}
</script>

<div class="flex m-auto">
	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] text-center">
		<div class="relative mx-auto z-20 flex items-center text-4xl">
			<h1 class="text-2xl pr-4 mt-auto flex flex-row">Application Status</h1>
		</div>
		<h1 class="select-all">{data.applicationid}</h1>

		{#if !data.discordid}
			<div class="flex flex-col space-y-2 text-center">
				<p class="text-sm text-muted-foreground">
					You have to link your discord account to fully submit your application.
				</p>

				{#if $message}
					<p class="bg-destructive/80 p-2">{$message}</p>
				{/if}
			</div>

			<Button
				disabled={$submitting || discordLinkDisabled}
				on:click={discord}
				variant="outline"
				size="sm">Link Discord</Button
			>
		{:else if !data.reviewed}
			<div class="bg-muted-foreground/10 rounded-xl p-2 flex flex-col gap-y-2">
				Your application is currently being reviewed.

				<h2 class="font-semibold">Do not lose your Application ID. Please save it.</h2>

				<a class="hover:underline font-semibold" href={env.PUBLIC_DISCORD_INVITE ?? ''}
					>Please join the discord server.</a
				>
			</div>
		{/if}

		{#if data.reviewed && data.accepted === true}
			<div class="bg-success/80 rounded-xl p-2">
				Your application has been accepted. Redirecting in 3 secs...
			</div>
		{:else if data.reviewed && data.accepted === false}
			<div class="bg-destructive/80 rounded-xl p-2">Your application has been denied.</div>

			<p>
				Reapplication is possible but there are only 3 chances so please make sure to review any
				mistakes.
			</p>

			<p>Verification codes have to be on your account or you will be denied!</p>
		{/if}
	</div>
</div>

<form action="?/link" method="post" use:enhance>
	<input type="hidden" name="code" bind:value={$formData.code} />
</form>
