<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import FriendAvatar from '$src/components/home/friendAvatar.svelte';

	import { pageName } from '$src/stores';
	pageName.set('Home');

	import { HeartCrack } from 'lucide-svelte';

	import EmptyCard from '$src/components/emptyCard.svelte';

	let friends = [1]; // TODO: Fetch real friends.
</script>

<div class="container p-8 flex flex-col">
	<h1 class="text-5xl leading-none tracking-tight">
		{data.welcomeMessage}, {data.session.username}...
	</h1>

	<div class="pt-24 flex flex-col gap-y-4">
		<div class="flex flex-row justify-between px-4">
			<h1 class="text-3xl">Friends ({friends.length})</h1>

			<a href="/friends"><h1 class="text-xl hover-underline">See All</h1></a>
		</div>

		<div
			class="supports-backdrop-blur:bg-background/60 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur flex flex-row overflow-x-auto p-4 gap-x-6 select-none outline-dashed outline-muted-foreground/20 rounded-xl"
		>
			{#if friends.length === 0}
				<EmptyCard />
			{:else}
				{#each friends as friend}
					<FriendAvatar state="game" username="Game{friend}" userid={1} />
				{/each}
			{/if}
			<!--TODO: FINISH this...-->
		</div>
	</div>
</div>
