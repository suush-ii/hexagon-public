<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'

	import { clanImages, hexagonClans, friendlyClanNames } from '$lib'
	import { formatCompactNumber } from '$lib/utils'
	import type { HexagonClans } from '$lib/types'
	import type { PageData } from './$types'
	import PieChart from '$src/components/leaderboard/pieChart.svelte'
	import Chart from '$src/components/leaderboard/chart.svelte'
	import UserAvatar from '$src/components/users/avatar.svelte'

	export let data: PageData

	type StatType = 'members' | 'knockouts' | 'averageKnockouts' | 'moons' | 'averageMoons'

	const getClanStat = (clan: HexagonClans, stat: StatType) => {
		const statKey =
			`${stat}${clan.charAt(0).toUpperCase() + clan.slice(1)}` as keyof typeof data.clanStats
		return data.clanStats[statKey]
	}
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Leaderboards</h1>

	<h1 class="text-3xl leading-none tracking-tight font-semibold">Clans</h1>

	<div class="flex flex-col gap-y-4">
		{#each hexagonClans as clan}
			<div class="flex gap-x-8 p-4 rounded-xl">
				<div class="w-20 h-20">
					<Avatar.Root class="w-full h-full rounded-xl aspect-square">
						<Avatar.Image src={clanImages[clan]} alt={friendlyClanNames[clan]} />
						<Avatar.Fallback />
					</Avatar.Root>
				</div>

				<div class="flex flex-col gap-y-8 w-full">
					<h1 class="text-xl">{friendlyClanNames[clan]}</h1>

					<div class="flex flex-wrap justify-around text-center max-w-3xl">
						<div>
							<p class="font-bold text-muted-foreground">Members</p>
							<p>{formatCompactNumber(Math.round(getClanStat(clan, 'members')), false)}</p>
						</div>

						<div>
							<p class="font-bold text-muted-foreground">Knockouts</p>
							<p>{formatCompactNumber(Math.round(getClanStat(clan, 'knockouts')), false)}</p>
						</div>

						<div>
							<p class="font-bold text-muted-foreground">Average Knockouts</p>
							<p>{formatCompactNumber(Math.round(getClanStat(clan, 'averageKnockouts')), false)}</p>
						</div>
						<div>
							<p class="font-bold text-muted-foreground">Moons</p>
							<p>{formatCompactNumber(Math.round(getClanStat(clan, 'moons')), false)}</p>
						</div>
						<div>
							<p class="font-bold text-muted-foreground">Average Moons</p>
							<p>{formatCompactNumber(Math.round(getClanStat(clan, 'averageMoons')), false)}</p>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<h1 class="text-3xl leading-none tracking-tight font-semibold">Global</h1>

	<div class="flex pt-8 gap-x-8 justify-between">
		<div class="flex flex-wrap gap-y-12 gap-x-8">
			{#if data.top1}
				<div class="w-54 h-54 flex flex-col space-y-6">
					<a href="/users/{data.top1.userid}/profile">
						<UserAvatar
							state={'winner'}
							userid={data.top1.userid}
							username={data.top1.username}
							css="w-16 h-16 mx-auto"
						/>
					</a>

					<h5 class="mx-auto">Top 25 Wealth</h5>

					<PieChart usersData={data.usersData} labels={data.labels} />
				</div>
			{/if}

			{#if data.top1StaffLess}
				<div class="w-54 h-54 flex flex-col space-y-4">
					<a href="/users/{data.top1StaffLess.userid}/profile">
						<UserAvatar
							state={'winner'}
							userid={data.top1StaffLess.userid}
							username={data.top1StaffLess.username}
							css="w-16 h-16 mx-auto"
						/>
					</a>

					<h5 class="mx-auto">Top 25 Wealth ( Non Staff )</h5>

					<PieChart usersData={data.usersDataStaffLess} labels={data.labelsStaffLess} />
				</div>
			{/if}

			{#if data.top1Knockouts}
				<div class="w-54 h-54 flex flex-col space-y-4">
					<a href="/users/{data.top1Knockouts.userid}/profile">
						<UserAvatar
							state={'winner'}
							userid={data.top1Knockouts.userid}
							username={data.top1Knockouts.username}
							css="w-16 h-16 mx-auto"
						/>
					</a>

					<h5 class="mx-auto">Top 25 Knockouts</h5>

					<PieChart usersData={data.usersDataKnockouts} labels={data.labelsKnockouts} />
				</div>
			{/if}

			{#if data.top1Rap}
				<div class="w-54 h-54 flex flex-col space-y-4">
					<a href="/users/{data.top1Rap.userid}/profile">
						<UserAvatar
							state={'winner'}
							userid={data.top1Rap.userid}
							username={data.top1Rap.username}
							css="w-16 h-16 mx-auto"
						/>
					</a>

					<h5 class="mx-auto">Top 25 RAP</h5>

					<PieChart usersData={data.usersDataRap} labels={data.labelsRap} />
				</div>
			{/if}
		</div>

		<div class="flex-grow h-[32rem]">
			<Chart signupHistory={data.signupHistory} />
		</div>
	</div>
</div>
