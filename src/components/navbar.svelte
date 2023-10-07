<script lang="ts">
	import { Button } from '$src/components/ui/button';
	import { page } from '$app/stores';

	export let loggedIn: boolean;
	export let signUpButton = false;
</script>

<header
	class="supports-backdrop-blur:bg-background/60 fixed top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur flex"
>
	<div class="container flex h-14 items-center">
		<nav class="flex items-center space-x-4 lg:space-x-6 w-full">
			<a href={loggedIn === false ? '/' : '/home'}
				><img alt="H" class="w-12" src="/hexagon128.png" /></a
			>
			<a
				href="/home"
				class="text-base font-medium {$page.url.pathname === '/home'
					? ''
					: 'text-muted-foreground'} transition-colors hover:text-primary"
			>
				Home
			</a>

			<a
				href="/games"
				class="text-base font-medium {$page.url.pathname === '/games'
					? ''
					: 'text-muted-foreground'} transition-colors hover:text-primary"
			>
				Games
			</a>
			<a
				href="/catalog"
				class="text-base font-medium {$page.url.pathname === '/catalog'
					? ''
					: 'text-muted-foreground'} transition-colors hover:text-primary"
			>
				Catalog
			</a>
			<a
				href="/develop"
				class="text-base font-medium {$page.url.pathname === '/develop'
					? ''
					: 'text-muted-foreground'} transition-colors hover:text-primary"
			>
				Develop
			</a>
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
					<a
						href="/users/1/profile"
						class="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Profile
					</a>

					<a
						href="/friends/requests"
						class="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Friends
					</a>
					<a
						href="/avatar"
						class="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Customize
					</a>
					<a
						href="/cum"
						class="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Cum
					</a>
				</nav>
			</div>
		</div>
	{/if}
</header>
