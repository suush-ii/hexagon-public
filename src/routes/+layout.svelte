<script>
	import '../app.postcss';
	import Navbar from '$src/components/navbar.svelte';

	import { page } from '$app/stores';
</script>

{#if $page.url.pathname != '/' && $page.url.pathname != "/login"}
	<!--TODO: if authorized-->
	<Navbar loggedIn={false} />

{:else if $page.url.pathname === "/login"}

<Navbar loggedIn={false} signUpButton={true} />

{/if}

<slot />
