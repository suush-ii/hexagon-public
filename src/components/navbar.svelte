<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import { page } from '$app/stores'
	import { Gamepad2 } from 'lucide-svelte'
	import { Wand2 } from 'lucide-svelte'
	import { Home } from 'lucide-svelte'
	import { Terminal } from 'lucide-svelte'
	import type { Component } from '$lib/types'
	import type { HTMLAnchorAttributes } from 'svelte/elements'
	import { Cog } from 'lucide-svelte'
	import { MoonStar } from 'lucide-svelte'
	import * as DropdownMenu from '$src/components/ui/dropdown-menu'

	import { currencyName, currencyNamePlural } from '$src/stores'

	export let loggedIn: boolean
	export let coins: number
	export let signUpButton = false
	export let userId = 0

	interface pagePrimitive extends HTMLAnchorAttributes {
		pageUrl: string
		friendlyName: string
		Icon?: Component
	}

	let pages: {
		notAuthenticated: pagePrimitive[]
		authenticated: pagePrimitive[]
	} = {
		notAuthenticated: [
			{ pageUrl: '/home', friendlyName: 'Home', Icon: Home },
			{ pageUrl: '/games', friendlyName: 'Games', Icon: Gamepad2 },
			{ pageUrl: '/catalog', friendlyName: 'Catalog', Icon: Wand2 },
			{ pageUrl: '/develop/games', friendlyName: 'Develop', Icon: Terminal }
		],
		authenticated: [
			{ pageUrl: `/users/${userId}/profile`, friendlyName: 'Profile' },
			{ pageUrl: '/friends/requests', friendlyName: 'Friends' },
			{ pageUrl: '/avatar', friendlyName: 'Customize' },
			{ pageUrl: '/c', friendlyName: 'c' }
		]
	}
</script>

<header
	class="supports-backdrop-blur:bg-background/60 fixed top-0 z-40 w-full border-b bg-background/95 shadow-sm flex"
>
	<div class="pl-1 sm:container flex h-14 items-center select-none">
		<nav class="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 w-full">
			<div class="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 w-full">
				<a href={loggedIn === false ? '/' : '/home'}
					><img alt="H" class="w-8 sm:w-12 max-w-xs" src="/hexagon128.png" /></a
				>
				{#each pages.notAuthenticated as navPage}
					<a
						href={navPage.pageUrl}
						class="text-sm sm:text-base font-medium space-y-1 {$page.url.pathname ===
							navPage.pageUrl ||
						$page.url.pathname.startsWith(navPage.pageUrl) ||
						(navPage.pageUrl === '/develop/games' && $page.url.pathname.startsWith('/develop'))
							? ''
							: 'text-muted-foreground'} transition-colors hover:text-primary group relative"
					>
						<div class="flex flex-row gap-x-1 sm:gap-x-2">
							<svelte:component this={navPage.Icon} class="h-6 sm:h-full" />
							{navPage.friendlyName}
						</div>
						{#if $page.url.pathname === navPage.pageUrl || $page.url.pathname.startsWith(navPage.pageUrl) || (navPage.pageUrl === '/develop/games' && $page.url.pathname.startsWith('/develop'))}
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
			</div>
			{#if signUpButton}
				<Button href="/" class="absolute right-0 hidden sm:block md:right-4" variant="outline"
					>Sign Up</Button
				>
			{/if}

			{#if loggedIn}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder
								><Button builders={[builder]} variant="minimal" class="text-lg" size="icon">
									<div class="flex items-center gap-x-3">
									<MoonStar class="h-full" />
									<h5 class="font-bold">{coins}</h5>
									</div>
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Label class="select-none">My Account </DropdownMenu.Label>
								<DropdownMenu.Separator />
								<a href="/transactions"><DropdownMenu.Item>My Transactions</DropdownMenu.Item></a>
								<DropdownMenu.Item
									>{coins}
									{coins != 1 ? currencyNamePlural : currencyName}
									<MoonStar class="h-4 ml-auto" />
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder
							><Button builders={[builder]} variant="outline" size="icon">
								<Cog />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Label class="select-none">My Account</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<a href="/settings"><DropdownMenu.Item>Settings</DropdownMenu.Item></a>
							<a href="/logout"><DropdownMenu.Item>Logout</DropdownMenu.Item></a>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
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
