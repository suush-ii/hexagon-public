<script lang="ts">
	import '../app.postcss';
	import Navbar from '$src/components/navbar.svelte';

	import { page } from '$app/stores';

	import type { PageData } from "./$types";

	export let data: PageData;

	$: loggedIn = data.session ? true : false 
</script>


<div class="flex flex-col h-screen">

{#if $page.url.pathname != '/' && $page.url.pathname != '/login'}
<!--TODO: if authorized-->
<Navbar loggedIn={loggedIn} />
{:else if $page.url.pathname === '/login'}
<Navbar loggedIn={loggedIn} signUpButton={true} />
{/if}

<main class="pt-{loggedIn === false ? "14": "24"} flex flex-1">
<slot />
</main>

</div>