<script lang="ts">
	import { Button } from '$src/components/ui/button';
	import { page } from '$app/stores';
	import { Gamepad2 } from 'lucide-svelte';
	import { Wand2 } from 'lucide-svelte';
	import { Home } from 'lucide-svelte';
	import { Terminal } from 'lucide-svelte';

	export let loggedIn: boolean;
	export let signUpButton = false;

	interface pagePrimitive {
		pageUrl: string;
		friendlyName: string;
		Icon?: any; // TODO: HACK!
	}

	let pages: {
		notAuthenticated: pagePrimitive[];
		authenticated: pagePrimitive[];
	} = {
		notAuthenticated: [
			{ pageUrl: '/home', friendlyName: 'Home', Icon: Home },
			{ pageUrl: '/games', friendlyName: 'Games', Icon: Gamepad2 },
			{ pageUrl: '/catalog', friendlyName: 'Catalog', Icon: Wand2 },
			{ pageUrl: '/develop', friendlyName: 'Develop', Icon: Terminal }
		],
		authenticated: [
			{ pageUrl: '/users/1/profile', friendlyName: 'Profile' },
			{ pageUrl: '/friends/requests', friendlyName: 'Friends' },
			{ pageUrl: '/avatar', friendlyName: 'Customize' },
			{ pageUrl: '/cum', friendlyName: 'Cum' }
		]
	};
</script>

<header
	class="supports-backdrop-blur:bg-background/60 fixed top-0 z-40 w-full border-b bg-background/95 shadow-sm flex"
>
	<div class="container flex h-14 items-center">
		<nav class="flex items-center space-x-4 lg:space-x-6 w-full">
			<a href={loggedIn === false ? '/' : '/home'}
				><img alt="H" class="w-12" src="/hexagon128.png" /></a
			>
			{#each pages.notAuthenticated as navPage}
				<a
					href={navPage.pageUrl}
					class="text-base font-medium space-y-1 {$page.url.pathname === navPage.pageUrl
						? ''
						: 'text-muted-foreground'} transition-colors hover:text-primary group relative"
				>
					<div class="flex flex-row gap-x-2">
						<svelte:component this={navPage.Icon} />
						{navPage.friendlyName}
					</div>
					{#if $page.url.pathname === navPage.pageUrl}
						<div
							class="transition-width delay-0 absolute min-h-[1px] w-full shadow-[inset_0_-2px_0_0_white]"
						/>
					{:else}
						<div
							class="transition-width delay-0 absolute min-h-[1px] w-4 group-hover:w-full group-hover:shadow-[inset_0_-2px_0_0_white]"
						/>
					{/if}
				</a>
			{/each}
			{#if signUpButton}
				<Button href="/" class="absolute right-4" variant="outline">Sign Up</Button>
			{/if}
		</nav>
	</div>
	{#if loggedIn}
		<div
			class="supports-backdrop-blur:bg-background/60 fixed top-14 z-40 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur flex"
		>
			<div class="container flex h-10 items-center">
				<nav class="flex items-center space-x-4 lg:space-x-6">
					{#each pages.authenticated as navPage}
						<a
							href={navPage.pageUrl}
							class="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							{navPage.friendlyName}
						</a>
					{/each}
				</nav>
			</div>
		</div>
	{/if}
</header>
