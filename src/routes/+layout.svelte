<script>
	import '../app.postcss';
	import Navbar from '$src/components/navbar.svelte';

	import { page } from '$app/stores';
</script>


<div class="flex flex-col h-screen">

{#if $page.url.pathname != '/' && $page.url.pathname != '/login'}
<!--TODO: if authorized-->
<Navbar loggedIn={false} />
{:else if $page.url.pathname === '/login'}
<Navbar loggedIn={false} signUpButton={true} />
{/if}

<main class="pt-14 flex flex-1">
<slot />
</main>

</div>