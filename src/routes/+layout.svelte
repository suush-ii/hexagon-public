<script>
	import '../app.postcss';
	import Navbar from '$src/components/navbar.svelte';

	import { page } from '$app/stores';
</script>

{#if $page.url.pathname != '/'}
	<!--TODO: if authorized-->
	<Navbar />
{/if}

<slot />
