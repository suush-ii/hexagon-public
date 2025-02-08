<script lang="ts">
	import * as Tabs from '$src/components/ui/tabs'
	import ReportButton from '$src/components/reportButton.svelte'
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import Configure from '$src/components/develop/edit/configure.svelte'
	import GameLeaderboard from '$src/components/games/gameLeaderboard.svelte'

	import GameThumbnail from '$src/components/games/gameThumbnail.svelte'

	import UserImage from '$src/components/userimage.svelte'

	import GameServers from '$src/components/games/gameServers.svelte'

	import { Button } from '$src/components/ui/button'

	import { Play, ThumbsUp, ThumbsDown, Loader2, Plus } from 'lucide-svelte'

	import DownloadModal from '$src/components/downloadModal.svelte'

	import { formatCompactNumber } from '$lib/utils'

	import { Separator } from '$src/components/ui/separator'

	import { pageName } from '$src/stores'

	import { page } from '$app/stores'

	import { invalidate } from '$app/navigation'

	import type { PageData } from './$types'

	import AllowedGear from '$src/components/games/allowedGear.svelte'

	import RelativeTime from '@yaireo/relative-time'

	import { newLib } from '.'
	import Favorite from '$src/components/favorite.svelte'
	import GameCard from '$src/components/games/gameCard.svelte'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import GamepassCard from '$src/components/games/gamepassCard.svelte'
	import BadgeCard from '$src/components/games/badgeCard.svelte'

	const defaultText = 'A server is loading the game...'

	let loadingText = defaultText

	const relativeTime = new RelativeTime()

	export let data: PageData

	pageName.set(data.place.placename)

	let submitting = false

	let open = false

	let downloadModal: DownloadModal

	let cancel = false

	let shutdownForm: HTMLFormElement

	let originalForm: HTMLFormElement

	function calculatePercent(likes: number, dislikes: number) {
		return Math.round((likes / (likes + dislikes)) * 100)
	}

	async function vote(type: 'like' | 'dislike') {
		// preview next action already

		if (data.alreadyVoted.voted && data.alreadyVoted.voteType === type) {
			// they unvoted

			data.place.associatedgame[type === 'like' ? 'likes' : 'dislikes'] -= 1
		} else if (data.alreadyVoted.voted && data.alreadyVoted.voteType !== type) {
			// they swapped they vote

			data.place.associatedgame[type === 'like' ? 'likes' : 'dislikes'] += 1

			data.place.associatedgame[type === 'like' ? 'dislikes' : 'likes'] -= 1
		} else if (data.alreadyVoted.voteType !== type) {
			// new vote

			data.place.associatedgame[type === 'like' ? 'likes' : 'dislikes'] += 1
		}

		data.likespercentage = calculatePercent(
			data.place.associatedgame.likes,
			data.place.associatedgame.dislikes
		)

		data.alreadyVoted.voted = true
		data.alreadyVoted.voteType = type

		submitting = true

		const updated = await fetch('/api/vote', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type, gameid: data.place.universeid })
		})

		await updated.json()

		await invalidate('app:game')

		submitting = false
	}

	let disableRandom = false

	let disableLoadingText = false

	function randomtext() {
		if (!disableRandom) {
			loadingText = newLib()
		}
	}

	async function placeLauncher(jobId?: string) {
		if (!cancel) {
			let query = new URLSearchParams()
			if (!jobId) {
				query.set('placeid', data.place.placeid.toString())
			} else {
				query.set('jobid', jobId)
			}

			const response = await fetch(`/game/PlaceLauncher.ashx?${query}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			})

			const json = await response.json()

			if (json.success === false) {
				loadingText = json.message
				return
			}

			if (json.status === 1) {
				if (!disableLoadingText) {
					loadingText = 'A server is loading the game...'
					disableLoadingText = true
				}

				setTimeout(() => {
					disableRandom = false

					randomtext()
					placeLauncher()
				}, 3000)
			} else if (json.status === 2) {
				loadingText = 'The server is ready. Joining the game...'
				const uri = `hexagon-player:1+launchmode:play+gameinfo:${json.authenticationTicket}+placelauncherurl:${encodeURIComponent(json.joinScriptUrl)}+version:${json.version}`
				document.location = uri

				console.log(json.joinScriptUrl)

				open = false

				disableRandom = true
				loadingText = defaultText

				downloadModal.open(uri)
			}
		}
	}

	function placeLauncherJob(event: CustomEvent<{ jobId: string }>) {
		placeLauncher(event.detail.jobId)
	}
</script>

<div class="container flex flex-col gap-y-4 p-4">
	<UserImage type="banner" />

	<div class="flex overflow-hidden flex-row gap-x-4 mx-auto w-full">
		<div class="flex flex-col gap-y-4 w-full h-fit">
			<div
				class="flex flex-col gap-y-4 p-4 supports-backdrop-blur:bg-background/60 bg-muted-foreground/5"
			>
				<div class="flex flex-row flex-wrap gap-x-4 xl:flex-nowrap">
					<div class="relative">
						<GameThumbnail
							assetUrl={data.place.associatedgame.thumbnail?.simpleasseturl}
							moderationState={data.place.associatedgame.thumbnail?.moderationstate}
							gamename={data.place.placename}
						/>
						{#if data.place.associatedgame.serversize > 20}
							<img
								class="absolute right-0 bottom-0 w-56 pointer-events-none"
								src="/Images/megaplace.png"
								alt="Mega"
							/>
						{/if}

						<img
							class="absolute left-0 bottom-0 w-24 pointer-events-none"
							src="/Images/{data.place.associatedgame.clientversion}.png"
							alt="Mega"
						/>
					</div>

					<div class="flex flex-col w-full">
						<div class="flex">
							<h1 class="mr-auto text-5xl font-semibold tracking-tight leading-none">
								{data.place.placename}
							</h1>

							{#if data.canEdit || data.canModerate}
								<Configure
									adminAsset={false}
									assetType={'games'}
									itemid={data.place.associatedgame.universeid}
									itemName={'Games'}
									authBearer={data.authBearer}
									baseurl={data.baseurl}
									placeid={data.place.placeid}
									canModerate={data.canModerate}
									{shutdownForm}
									{originalForm}
								/>
							{/if}
						</div>

						<h1 class="text-2xl text-muted-foreground">
							By <a
								class="text-primary hover:underline"
								href="/users/{data.place.associatedgame.creatoruserid}/profile"
								>{data.place.associatedgame.author.username}</a
							>
						</h1>
						<Separator class="mt-24" />

						{#if data.place.associatedasset.moderationstate === 'approved'}
							<AlertDialog.Root closeOnOutsideClick={false} bind:open>
								<AlertDialog.Trigger asChild let:builder>
									{#if data.userAgent?.includes('Android') === true || data.userAgent?.includes('iPhone') === true}
										<a
											data-sveltekit-reload
											href="/games/start?placeid={data.place.placeid}"
											class="mt-auto"
										>
											<Button
												variant="minimal"
												size="lg"
												builders={[builder]}
												class="flex gap-x-4 mt-4 w-full h-16 rounded-xl xl:mt-auto hover:shadow-md hover:shadow-white bg-blue-600"
											>
												<Play class="w-full h-10 fill-white" />
											</Button>
										</a>
									{:else}
										<Button
											variant="minimal"
											size="lg"
											builders={[builder]}
											class="flex gap-x-4 mt-4 w-full h-16 rounded-xl xl:mt-auto hover:shadow-md hover:shadow-white bg-blue-600"
											on:click={() => {
												cancel = false
												placeLauncher()
												disableLoadingText = false
											}}
										>
											<Play class="w-full h-10 fill-white" />
										</Button>
									{/if}
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<Loader2 class="mx-auto w-24 h-24 animate-spin" />
										<h1 class="text-2xl font-semibold text-center">{loadingText}</h1>
									</AlertDialog.Header>

									<AlertDialog.Cancel asChild let:builder>
										<Button
											size="sm"
											builders={[builder]}
											on:click={() => {
												cancel = true
											}}>Cancel</Button
										>
									</AlertDialog.Cancel>
								</AlertDialog.Content>
							</AlertDialog.Root>
						{:else}
							<h1 class="text-lg">Sorry, this place is currently under review. Try again later.</h1>
						{/if}

						<DownloadModal bind:this={downloadModal} type={'player'} />
						<Separator class="mt-auto" />
						<div class="flex flex-row gap-x-4">
							<Favorite
								alreadyFavorited={data.alreadyFavorited}
								assetid={data.place.placeid}
								favorites={data.favorites}
								game={true}
							/>
							<div class="flex flex-col px-4 w-full">
								<div class="flex flex-row justify-around w-full">
									<div class="flex flex-row text-success">
										<Button
											variant="minimalcurrent"
											size="icon"
											on:click={() => {
												vote('like')
											}}
											disabled={submitting}
										>
											<ThumbsUp
												class="hover:fill-success {data.alreadyVoted.voted === true &&
												data.alreadyVoted?.voteType === 'like'
													? 'fill-success'
													: ''}"
											/>
										</Button>
									</div>
									<div class="flex flex-row text-destructive">
										<Button
											variant="minimalcurrent"
											size="icon"
											on:click={() => {
												vote('dislike')
											}}
											disabled={submitting}
										>
											<ThumbsDown
												class="hover:fill-destructive {data.alreadyVoted.voted === true &&
												data.alreadyVoted?.voteType === 'dislike'
													? 'fill-destructive'
													: ''}"
											/>
										</Button>
									</div>
								</div>
								<div class="flex flex-col w-full">
									<div
										class="w-full h-2 {isNaN(data.likespercentage)
											? ''
											: 'bg-destructive'} rounded-xl"
									>
										<div
											class="h-2 {isNaN(data.likespercentage)
												? 'bg-muted-foreground/25'
												: 'bg-success'} rounded-xl"
											style="width: {data.likespercentage}%;"
										/>
									</div>

									<div class="flex flex-row justify-between">
										<h1 class="mx-8 text-success">
											{formatCompactNumber(data.place.associatedgame.likes)}
										</h1>
										{#if submitting}
											<Loader2 class="w-6 h-6 animate-spin" />
										{/if}

										{#if !isNaN(data.likespercentage) && !submitting}
											<h1 class="">{data.likespercentage}%</h1>
										{/if}
										<h1 class="mx-8 text-destructive">
											{formatCompactNumber(data.place.associatedgame.dislikes)}
										</h1>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex flex-row flex-wrap">
					<Tabs.Root
						value={$page.url.searchParams.get('page') === 'servers'
							? 'servers'
							: $page.url.searchParams.get('page') === 'store'
								? 'store'
								: $page.url.searchParams.get('page') === 'leaderboards'
									? 'leaderboards'
									: 'about'}
						class="flex flex-col gap-y-4 w-full"
					>
						<Tabs.List class="justify-around w-full">
							<a href="?page=about" class="w-full"
								><Tabs.Trigger class="w-full pointer-events-none" value="about"
									>{data.t('games.about')}</Tabs.Trigger
								></a
							>
							<a href="?page=store" class="w-full"
								><Tabs.Trigger class="w-full pointer-events-none" value="store">Store</Tabs.Trigger
								></a
							>
							<a href="?page=leaderboards" class="w-full"
								><Tabs.Trigger class="w-full pointer-events-none" value="leaderboards"
									>Leaderboards</Tabs.Trigger
								></a
							>
							<a href="?page=servers" class="w-full"
								><Tabs.Trigger class="w-full pointer-events-none" value="servers"
									>{data.t('games.servers')}</Tabs.Trigger
								></a
							>
						</Tabs.List>
						<Tabs.Content value="about">
							<h1 class="text-2xl font-semibold">Description</h1>
							<div class="p-4 space-y-4">
								<h1 class="text-xl whitespace-pre-line break-words">
									{data.place.associatedgame.description}
								</h1>
								<Separator class="mt-2" />

								<div class="flex flex-row flex-wrap justify-around w-full text-center items-center">
									<div>
										<p class="font-bold text-muted-foreground">{data.t('games.visits')}</p>
										<p>{formatCompactNumber(data.place.associatedgame.visits)}</p>
									</div>

									<div>
										<p class="font-bold text-muted-foreground">{data.t('assetGeneric.created')}</p>
										<p>{data.place.created.toLocaleDateString('en-US')}</p>
									</div>

									<div>
										<p class="font-bold text-muted-foreground">{data.t('assetGeneric.updated')}</p>
										<p>{relativeTime.from(data.place.updated)}</p>
									</div>

									<div>
										<p class="font-bold text-muted-foreground">{data.t('games.maxPlayers')}</p>
										<p>{data.place.associatedgame.serversize}</p>
									</div>

									<div>
										<p class="font-bold text-muted-foreground">{data.t('games.genre')}</p>
										<p>{data.place.associatedgame.genre}</p>
									</div>

									<div>
										<p class="font-bold text-muted-foreground">{data.t('games.allowedGear')}</p>
										<AllowedGear
											allowedGear={data.place.allowedgear ?? []}
											genreEnforcement={data.place.geargenreenforced}
											gameGenre={data.place.associatedgame.genre}
										/>
									</div>
								</div>
								<Separator class="mt-2" />
							</div>
						</Tabs.Content>
						<ReportButton class="ml-auto" />

						{#if $page.url.searchParams.get('page') === 'servers'}
							<Tabs.Content value="servers" class="flex flex-col gap-y-4">
								<h1 class="text-2xl font-semibold">{data.t('games.servers')}</h1>
								<GameServers
									servers={data.servers}
									serverSize={data.place.associatedgame.serversize}
									on:placelauncher={(event) => {
										cancel = false
										placeLauncherJob(event)
										disableLoadingText = false
									}}
								/>
							</Tabs.Content>
						{/if}

						{#if $page.url.searchParams.get('page') === 'store'}
							<Tabs.Content value="store" class="flex flex-col gap-y-4">
								<h1 class="text-2xl font-semibold">Passes for this game</h1>

								<div class="flex flex-wrap gap-x-4">
									{#each data.passes as pass}
										<GamepassCard
											assetid={pass.assetid}
											assetname={pass.assetname}
											price={pass.price ?? 0}
											own={pass.own}
										/>
									{/each}

									{#if data.canEdit}
										<div class="h-full flex text-center p-4">
											<a
												href="/develop/games/{data.place.associatedgame
													.universeid}/edit/gamepasses/upload"
												class="m-auto flex flex-col"><Plus class="w-24 h-24" /> Add Pass</a
											>
										</div>
									{/if}

									{#if data.passes.length <= 0}
										<EmptyCard class="p-8 m-auto" />
									{/if}
								</div>
							</Tabs.Content>
						{/if}

						{#if $page.url.searchParams.get('page') === 'leaderboards'}
							<Tabs.Content
								value="store"
								class="flex flex-col gap-y-4 max-h-[60rem] overflow-y-auto"
							>
								<h1 class="text-2xl font-semibold">Players</h1>

								<Separator />

								<GameLeaderboard
									leaderboard={data.leaderboard}
									leaderboardCount={data.leaderboardCount}
									placeId={data.place.placeid}
								/>
							</Tabs.Content>
						{/if}
					</Tabs.Root>
				</div>
			</div>

			{#if ($page.url.searchParams.get('page') ?? 'about') === 'about'}
				<h1 class="text-2xl font-semibold">Badges</h1>

				<div class="space-y-4">
					{#each data.badges as badge}
						<BadgeCard
							assetid={badge.assetid}
							assetname={badge.assetname}
							description={badge.description}
							obtaineddate={badge.obtaineddate}
							wonyesterday={badge.wonyesterday}
							wonever={badge.wonever}
							joinedGameCount={data.joinedGameCount}
						/>
					{/each}
				</div>
			{/if}

			<h1 class="text-2xl font-semibold">{data.t('games.recommendedGames')}</h1>

			<div class="flex flex-row flex-wrap gap-x-5 w-full">
				{#if data.recommendations.length > 0}
					{#each data.recommendations as game}
						<GameCard
							gameId={game.place.placeid}
							gameName={game.place.placename}
							playerCount={game.active}
							assetUrl={game.icon?.simpleasseturl}
							moderationState={game.icon?.moderationstate}
						/>
					{/each}
				{:else}
					<EmptyCard class="p-8 m-auto" />
				{/if}
			</div>
		</div>

		<UserImage type="skyscraper" />
	</div>
</div>

<form action="?/shutdown" method="post" bind:this={shutdownForm}></form>

<form action="?/originalgame" method="post" bind:this={originalForm}></form>
