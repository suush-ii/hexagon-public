<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import { page } from '$app/stores'
	import { Gamepad2 } from 'lucide-svelte'
	import { Wand2 } from 'lucide-svelte'
	import { Home } from 'lucide-svelte'
	import { X } from 'lucide-svelte'
	import { Terminal } from 'lucide-svelte'
	import { UsersRound } from 'lucide-svelte'
	import type { Component } from '$lib/types'
	import type { HTMLAnchorAttributes } from 'svelte/elements'
	import { Cog } from 'lucide-svelte'
	import { MoonStar } from 'lucide-svelte'
	import * as DropdownMenu from '$src/components/ui/dropdown-menu'
	import { formatCompactNumber } from '$lib/utils'
	import { localStorageStore } from '$src/stores'

	import { currencyName, currencyNamePlural } from '$src/stores'
	import { browser } from '$app/environment'

	import type { Writable } from 'svelte/store'
	import { Badge } from './ui/badge'

	export let loggedIn: boolean
	export let coins: number
	export let signUpButton = false
	export let userId = 0
	export let admin = false
	export let sitealert: string
	export let friendRequests: number
	export let tradeRequests: number

	interface pagePrimitive extends HTMLAnchorAttributes {
		pageUrl: string
		friendlyName: string
		Icon?: Component
		protected?: boolean
		badge?: number
	}

	$: pages = {
		notAuthenticated: [
			{ pageUrl: '/home', friendlyName: $page.data.t('generic.home'), Icon: Home },
			{ pageUrl: '/games', friendlyName: $page.data.t('generic.games'), Icon: Gamepad2 },
			{ pageUrl: '/catalog', friendlyName: $page.data.t('generic.catalog'), Icon: Wand2 },
			{ pageUrl: '/people', friendlyName: $page.data.t('generic.people'), Icon: UsersRound },
			{ pageUrl: '/develop/games', friendlyName: $page.data.t('generic.develop'), Icon: Terminal }
		],
		authenticated: [
			{ pageUrl: `/users/${userId}/profile`, friendlyName: $page.data.t('generic.profile') },
			{
				pageUrl: '/friends/requests',
				friendlyName: $page.data.t('generic.friends'),
				badge: friendRequests
			},
			{ pageUrl: '/avatar', friendlyName: $page.data.t('generic.customize') },
			{ pageUrl: '/trades', friendlyName: 'Trades', badge: tradeRequests },
			{ pageUrl: '/admin', friendlyName: $page.data.t('generic.admin'), protected: true }
		]
	} as { notAuthenticated: pagePrimitive[]; authenticated: pagePrimitive[] }

	let storedalert: Writable<string>

	if (browser) {
		storedalert = localStorageStore('storedalert', '')
	}
</script>

<header
	class="supports-backdrop-blur:bg-background/60 fixed top-0 z-40 w-screen border-b bg-background/95 shadow-sm flex"
>
	<div class="pl-1 sm:container flex h-14 items-center select-none">
		<nav class="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 w-full">
			<div class="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 w-full">
				<a href={loggedIn === false ? '/' : '/home'}
					><img alt="H" class="w-8 sm:w-12 max-w-xs mr-0 ml-6" src="/hexagon128.png" /></a
				>
				{#each pages.notAuthenticated as navPage}
					<a
						href={navPage.pageUrl}
						class="text-sm sm:text-base font-medium space-y-1 mr-0 ml-6 {$page.url.pathname ===
							navPage.pageUrl ||
						$page.url.pathname.startsWith(navPage.pageUrl) ||
						(navPage.pageUrl === '/develop/games' && $page.url.pathname.startsWith('/develop'))
							? ''
							: 'text-muted-foreground'} transition-colors hover:text-primary group relative"
					>
						<div class="flex flex-row space-x-1 sm:space-x-2">
							<svelte:component this={navPage.Icon} class="h-6 ml-2 sm:ml-0" />
							<h1 class="ml-1 mr-0 hidden sm:ml-2 sm:block">
								{navPage.friendlyName}
							</h1>
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
				<Button href="/" class="absolute right-0 hidden sm:block md:right-6" variant="outline"
					>{$page.data.t('signUpLogin.signUp')}</Button
				>
			{/if}

			{#if loggedIn}
				<div class="flex gap-x-2">
					<DropdownMenu.Root preventScroll={false}>
						<DropdownMenu.Trigger asChild let:builder
							><Button builders={[builder]} variant="minimal" class="text-lg w-full" size="icon">
								<div class="flex items-center gap-x-3">
									<MoonStar class="h-full" />
									<h5 class="hidden sm:block font-bold">{formatCompactNumber(coins, false)}</h5>
								</div>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Label class="select-none"
								>{$page.data.t('generic.myAccount')}</DropdownMenu.Label
							>
							<DropdownMenu.Separator />
							<a href="/transactions"
								><DropdownMenu.Item class="cursor-pointer"
									>{$page.data.t('transactions.myTransactions')}</DropdownMenu.Item
								></a
							>
							<DropdownMenu.Item
								>{formatCompactNumber(coins)}
								{coins != 1 ? currencyNamePlural : currencyName}
								<MoonStar class="h-4 ml-auto" />
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<DropdownMenu.Root preventScroll={false}>
						<DropdownMenu.Trigger asChild let:builder
							><Button builders={[builder]} variant="outline" size="icon">
								<Cog />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Label class="select-none"
								>{$page.data.t('generic.myAccount')}</DropdownMenu.Label
							>
							<DropdownMenu.Separator />
							<a href="/settings"
								><DropdownMenu.Item class="cursor-pointer"
									>{$page.data.t('generic.settings')}</DropdownMenu.Item
								></a
							>
							<a href="/logout"
								><DropdownMenu.Item class="cursor-pointer"
									>{$page.data.t('generic.logout')}</DropdownMenu.Item
								></a
							>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/if}
		</nav>
	</div>
	{#if loggedIn}
		<div
			class="supports-backdrop-blur:bg-background/60 fixed top-14 z-40 w-screen border-b bg-muted-foreground/5 shadow-sm backdrop-blur flex"
		>
			<div class="container flex h-10 items-center">
				<nav class="flex items-center space-x-4 lg:space-x-6">
					{#each pages.authenticated as navPage}
						{#if navPage.badge || navPage?.badge === 0}
							<a
								class="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
								href={navPage.pageUrl}
							>
								<div class="flex gap-x-2 items-center">
									{navPage.friendlyName}

									<Badge class="h-4" variant="secondary">{navPage.badge}</Badge>
								</div></a
							>
						{:else if (navPage?.protected === true && admin === true) || !navPage?.protected}
							<a
								href={navPage.pageUrl}
								class="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
							>
								{navPage.friendlyName}
							</a>
						{/if}
					{/each}
				</nav>
			</div>
		</div>

		{#if sitealert && sitealert !== '' && sitealert !== $storedalert && storedalert}
			<div
				class="supports-backdrop-blur:bg-background/60 fixed top-24 z-40 w-full border-b bg-orange shadow-sm backdrop-blur flex"
			>
				<div class="container flex h-6 items-center">
					<nav class="flex items-center space-x-4 lg:space-x-6">
						<h1 class="text-lg font-semibold">{sitealert}</h1>
					</nav>
					<button
						on:click={() => {
							storedalert.set(sitealert)
						}}
						class="ml-auto"><X /></button
					>
				</div>
			</div>
		{/if}
	{/if}
</header>
