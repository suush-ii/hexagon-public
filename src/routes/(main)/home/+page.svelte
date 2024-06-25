<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	import FriendAvatar from '$src/components/home/friendAvatar.svelte'

	import GameCard from '$src/components/games/gameCard.svelte'

	import { pageName } from '$src/stores'
	import { interpolate } from '$lib/poly-i18n/interpolate'

	pageName.set(data.t('generic.home'))

	import EmptyCard from '$src/components/emptyCard.svelte'
	import SeeAll from '$src/components/seeAll.svelte'
	import Avatar from '$src/components/users/avatar.svelte'

	$: recentlyPlayed = data.recentlyPlayed
</script>

<div class="container p-8 flex flex-col">
	<div class="flex">
		<a href="/users/{data.user.userid}/profile">
			<Avatar
				state={'online'}
				userid={data.user.userid}
				username={data.user.username}
				disableoutline={true}
				css="w-48 h-48 !rounded-none"
			/>
		</a>

		<h1 class="text-5xl leading-none tracking-tight font-semibold my-auto">
			{data.welcomeMessage}, {data.user.username}...
		</h1>
	</div>

	<div class="pt-24 flex flex-col gap-y-4">
		<div class="flex flex-row justify-between px-4">
			<h1 class="text-3xl">
				{interpolate(data.t('home.friends'), { count: data.friendCount.toString() })}
			</h1>

			<SeeAll href="/friends" />
		</div>

		<div
			class="supports-backdrop-blur:bg-background/60 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur flex flex-row overflow-x-auto p-4 gap-x-10 outline-dashed outline-muted-foreground/20 rounded-xl"
		>
			{#if data.friendCount === 0}
				<EmptyCard />
			{:else}
				{#each data.friends as friend}
					<a href="/users/{friend.sender.userid}/profile">
						<FriendAvatar
							state={friend.status}
							username={friend.sender.username}
							userid={friend.sender.userid}
						/>
					</a>
				{/each}
			{/if}
			<!--TODO: FINISH this...-->
		</div>

		<div class="flex flex-row justify-between px-4 mt-6">
			<h1 class="text-3xl">{data.t('home.recentlyPlayed')}</h1>

			<SeeAll href="/recentlyplayed" />
		</div>

		<div class="flex flex-row gap-x-5 w-full">
			{#if recentlyPlayed.length > 0}
				{#each recentlyPlayed as game}
					<GameCard
						gameId={game.game.places[0].placeid}
						gameName={game.game.gamename}
						playerCount={game.game.active}
						iconId={game.game.iconid ?? 0}
					/>
				{/each}
			{:else}
				<EmptyCard class="p-8 m-auto">
					<h5 class="text-center">
						Maybe play some <a href="/games" class="hover:underline font-semibold">games</a>?
					</h5>
				</EmptyCard>
			{/if}
		</div>
	</div>
</div>
