<script lang="ts">
	import { page } from '$app/stores'

	import * as Card from '$src/components/ui/card'

	import { Button } from '$src/components/ui/button'

	import { HeartCrack } from 'lucide-svelte'

	import '$src/app.postcss'

	import Navbar from '$src/components/navbar.svelte'

	import type { LayoutData } from './$types'

	import { appName } from '$src/stores'

	export let data: LayoutData

	$: loggedIn = data.session ? true : false
</script>

<svelte:head>
	<title>{appName}</title>
	<link rel="icon" type="image/png" href="/hexagon128.png" />
</svelte:head>

<div class="flex flex-col h-screen">
	<Navbar {loggedIn} userId={data.session?.userid} coins={data.session?.coins} />
	<div class="m-auto flex">
		<Card.Root class="w-96 p-4 text-center m-auto">
			<Card.Header class="flex flex-col gap-y-2">
				<div class="flex flex-row mx-auto gap-x-2">
					<HeartCrack class="w-8 h-8" strokeWidth={1.2} />
					<Card.Title class="text-3xl font-bold">{$page.status}</Card.Title>
				</div>
				<Card.Description>Uh oh an fucky wucky occured!</Card.Description>
				{#if $page.status != 404 && $page.status != 400 && $page.status != 403 && $page.status != 405}
					<Card.Description
						>Don't worry your error has been logged and our team is working on it! uwu</Card.Description
					>
				{/if}
			</Card.Header>
			<Card.Content>
				<p>{$page.error?.message}</p>
			</Card.Content>
			<Card.Footer>
				<Button
					on:click={() => {
						history.back()
					}}
					variant="outline"
					class="w-full">Go back</Button
				>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
