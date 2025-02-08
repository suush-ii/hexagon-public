<script lang="ts">
	import UserAvatar from '$src/components/users/avatar.svelte'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import { formatCompactNumber } from '$lib/utils'
	import { Button } from '../ui/button'

	export let leaderboard: {
		amount: number
		associateduser: {
			userid: number
			username: string
		}
		rank: string
	}[]

	export let leaderboardCount

	export let placeId: number

	let page = 30

	let disabled = false

	async function fetchLeaderboard() {
		disabled = true

		page++

		const res = await fetch(`/api/games/leaderboard?page=${page}&placeId=${placeId}`)
		const data = await res.json()

		leaderboard = [...leaderboard, ...data.leaderboard]

		if (data.leaderboard.length === 0) {
			disabled = true
		} else {
			disabled = false
		}
	}
</script>

{#if leaderboard.length === 0}
	<EmptyCard><h5 class="text-center mx-auto select-none">Maybe earn some points!</h5></EmptyCard>
{:else}
	{#each leaderboard as player}
		<div class="flex gap-x-4 p-4">
			<div class="flex relative">
				<h1 class="text-xl font-semibold absolute top-3">{player.rank}</h1>

				<a href="/users/{player.associateduser.userid}/profile"
					><UserAvatar
						css="rounded-xl"
						userid={player.associateduser.userid}
						username={player.associateduser.username}
						type="avatar"
						disable3d={true}
					/></a
				>
			</div>

			<div class="flex flex-col gap-y-1">
				<a href="/users/{player.associateduser.userid}/profile"
					><h1 class="text-xl hover:underline underline-offset-2 font-semibold">
						{player.associateduser.username}
					</h1></a
				>
			</div>

			<h1 class="ml-auto px-8 my-auto text-lg font-semibold">
				{formatCompactNumber(player.amount)}
			</h1>
		</div>
	{/each}

	<Button
		variant="outline"
		disabled={leaderboardCount <= 30 ? true : false || disabled}
		on:click={fetchLeaderboard}>See More</Button
	>
{/if}
