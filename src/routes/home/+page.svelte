<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import * as Avatar from '$src/components/ui/avatar';

	import { HeartCrack } from 'lucide-svelte';

	let friends = [1] // TODO: Fetch real friends.
</script>

<div class="container p-8 flex flex-col">
	<h1 class="text-5xl leading-none tracking-tight">
		{data.welcomeMessage}, {data.session.username}...
	</h1>

	<div class="pt-24 flex flex-col gap-y-4">

	<div class="flex flex-row justify-between px-4">

	<h1 class="text-3xl">Friends ({friends.length})</h1>

	<a href="/friends"><h1 class="text-xl">See All</h1></a>

	</div>

	<div
		class="supports-backdrop-blur:bg-background/60 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur flex flex-row overflow-x-auto p-4 gap-x-6 select-none outline-dashed outline-muted-foreground/20 rounded-xl"
	>
		{#if friends.length === 0}
		<div class="mx-auto flex flex-col w-full gap-y-4">
			<HeartCrack class="w-24 h-24 mx-auto" strokeWidth={1.2} />
			<h5 class="text-center mx-auto">There seems to be no one here... 😕</h5>
		</div>

		{:else}
		{#each friends as friend}
		<div class="flex flex-col gap-y-1">
			<Avatar.Root class="w-24 h-24 outline-offset-4 outline-success outline-dashed">
				<Avatar.Image src="https://avaatars.githubusercontent.com/u/54828677?v=4" alt="@sushidesigner" />
				<Avatar.Fallback></Avatar.Fallback>
			  </Avatar.Root>
			  <p class="truncate w-24 text-center">Game</p>
		</div>
		<div class="flex flex-col gap-y-1">
			<Avatar.Root class="w-24 h-24 outline-offset-4 outline-blue-500 outline-dashed">
				<Avatar.Image src="https://avaatars.githubusercontent.com/u/54828677?v=4" alt="@sushidesigner" />
				<Avatar.Fallback></Avatar.Fallback>
			  </Avatar.Root>
			  <p class="truncate w-24 text-center">Online</p>
		</div>
		<div class="flex flex-col gap-y-1">
			<Avatar.Root class="w-24 h-24 outline-offset-4 outline-muted-foreground/70 outline-dashed">
				<Avatar.Image src="https://avataars.githubusercontent.com/u/54828677?v=4" alt="@sushidesigner" />
				<Avatar.Fallback></Avatar.Fallback>
			  </Avatar.Root>
			  <p class="truncate w-24 text-center">Offline</p>
		</div>
		<div class="flex flex-col gap-y-1">
			<Avatar.Root class="w-24 h-24 outline-offset-4 outline-orange-500 outline-dashed">
				<Avatar.Image src="https://avataars.githubusercontent.com/u/54828677?v=4" alt="@sushidesigner" />
				<Avatar.Fallback></Avatar.Fallback>
			  </Avatar.Root>
			  <p class="truncate w-24 text-center">Studio</p>
		</div>
		{/each}
		{/if}
		<!--TODO: FINISH this...-->
	</div>

</div>

</div>
