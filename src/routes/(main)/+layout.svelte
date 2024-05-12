<script lang="ts">
	import '$src/app.postcss'
	import Navbar from '$src/components/navbar.svelte'

	import { Toaster } from '$src/components/ui/sonner'

	import { page } from '$app/stores'

	import type { PageData } from './$types'
	import { appName, pageName } from '$src/stores'

	export let data: PageData

	$: loggedIn = data.user ? true : false

	$: admin =
		data?.user?.role === 'owner' ||
		data?.user?.role === 'admin' ||
		data?.user?.role === 'mod' ||
		data?.user?.role === 'uploader'
			? true
			: false

	$: newPageName = ($pageName ?? '') + ($pageName ? ' -' : '') // if we do not have a pageName just send Hexagon
</script>

<svelte:head>
	<title>{newPageName} {appName}</title>
	<link rel="icon" type="image/png" href="/hexagon128.png" />
</svelte:head>

<div class="flex flex-col h-screen">
	{#if $page.url.pathname != '/' && $page.url.pathname != '/login'}
		<Navbar
			{loggedIn}
			userId={data?.user?.userid}
			coins={data?.user?.coins}
			{admin}
			sitealert={data.sitealert}
		/>
	{:else if $page.url.pathname === '/login'}
		<Navbar
			{loggedIn}
			signUpButton={true}
			coins={data?.user?.coins}
			{admin}
			sitealert={data.sitealert}
		/>
	{/if}

	<main
		class="pt-24 {$page.url.pathname != '/' && $page.url.pathname != '/login'
			? ''
			: '!pt-0'} flex flex-1 flex-wrap"
	>
		<Toaster theme="dark" />

		<slot />
	</main>
</div>
