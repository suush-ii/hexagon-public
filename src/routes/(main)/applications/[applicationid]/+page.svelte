<script lang="ts">
	import type { PageData } from './$types'

	import { pageName } from '$src/stores'
	import { Button } from '$src/components/ui/button'
	import { localStorageStore } from '$src/stores'
	import type { Writable } from 'svelte/store'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { env } from '$env/dynamic/public'

	export let data: PageData

	pageName.set('Applications')

	let linkForm: HTMLFormElement,
		discordLinkDisabled = false,
		discordToken = ''

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
			</div>

			<Button
				disabled={discordLinkDisabled}
				on:click={() => {
					discord(linkForm)
				}}
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
		{/if}
	</div>
</div>

<form action="?/link" method="post" bind:this={linkForm}>
	<input type="hidden" name="code" bind:value={discordToken} />
</form>
