<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import * as Tabs from '$src/components/ui/tabs'
	import ReportButton from '$src/components/reportButton.svelte'

	import UserImage from '$src/components/userimage.svelte'

	import GameServers from '$src/components/games/gameServers.svelte'

	import { Button } from '$src/components/ui/button'

	import { Play, ThumbsUp, ThumbsDown, Loader2, Star } from 'lucide-svelte'

	import { formatCompactNumber } from '$lib/utils'

	import { Separator } from '$src/components/ui/separator'

	import { pageName } from '$src/stores'

	import { page } from '$app/stores'

	import { invalidate } from '$app/navigation'

	import type { PageData } from './$types'

	import AllowedGear from '$src/components/games/allowedGear.svelte'

	import RelativeTime from '@yaireo/relative-time'

	const relativeTime = new RelativeTime()

	export let data: PageData

	pageName.set(data.place.associatedgame.gamename)

	let submitting = false

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
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<UserImage type="banner" />

	<div class="flex flex-row mx-auto gap-x-4 w-full overflow-hidden">
		<div
			class="flex flex-col w-full h-fit supports-backdrop-blur:bg-background/60 bg-muted-foreground/5 p-4 gap-y-4"
		>
			<div class="flex flex-row flex-wrap xl:flex-nowrap gap-x-4">
				<Avatar.Root class="xl:h-[360px] h-fit w-full max-w-[640px] rounded-xl aspect-video">
					<Avatar.Image
						src={data.place.associatedgame.thumbnailurl
							? data.place.associatedgame.thumbnailurl
							: '/Images/thumbnailplaceholder.png'}
						alt={data.place.associatedgame.gamename}
						loading="lazy"
					/>
					<Avatar.Fallback />
				</Avatar.Root>

				<div class="flex flex-col w-full">
					<h1 class="text-5xl leading-none tracking-tight font-semibold">
						{data.place.associatedgame.gamename}
					</h1>

					<h1 class="text-2xl text-muted-foreground">
						By <a
							class="text-primary hover:underline"
							href="/users/{data.place.associatedgame.creatoruserid}/profile"
							>{data.place.associatedgame.author.username}</a
						>
					</h1>
					<Separator class="mt-2" />
					<Button
						on:click={() => {
							document.location = `hexagonlaunch://${data.place.placeid}[${data.ticket}[${2016}[player`
						}}
						variant="minimal"
						size="lg"
						class="w-full h-16 mt-4 xl:mt-auto hover:shadow-md hover:shadow-white bg-success flex gap-x-4 rounded-xl"
					>
						<Play class="w-full h-10 fill-white" />
					</Button>
					<Separator class="mt-2" />
					<div class="flex flex-row gap-x-4">
						<h1 class="text-lg font-semibold flex align-middle my-auto gap-x-1 text-yellow-400">
							<Star class="hover:fill-yellow-400" size={28} /> 0
						</h1>
						<div class="flex flex-col w-full px-4">
							<div class="flex flex-row justify-around w-full">
								<div class="text-success flex flex-row">
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
								<div class="text-destructive flex flex-row">
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
							<div class="w-full flex flex-col">
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
									<h1 class="text-success mx-8">
										{formatCompactNumber(data.place.associatedgame.likes)}
									</h1>
									{#if submitting}
										<Loader2 class="h-6 w-6 animate-spin" />
									{/if}

									{#if !isNaN(data.likespercentage) && !submitting}
										<h1 class="">{data.likespercentage}%</h1>
									{/if}
									<h1 class="text-destructive mx-8">
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
					value={$page.url.searchParams.get('page') === 'servers' ? 'servers' : 'about'}
					class="w-full flex flex-col gap-y-4"
				>
					<Tabs.List class="w-full justify-around">
						<a href="?page=about" class="w-full"
							><Tabs.Trigger class="w-full pointer-events-none" value="about">About</Tabs.Trigger
							></a
						>
						<a href="?page=servers" class="w-full"
							><Tabs.Trigger class="w-full pointer-events-none" value="servers"
								>Servers</Tabs.Trigger
							></a
						>
					</Tabs.List>
					<Tabs.Content value="about">
						<h1 class="text-2xl font-semibold">Description</h1>
						<div class="p-4 space-y-4">
							<h1 class="break-words text-xl whitespace-pre-line">
								{data.place.associatedgame.description}
							</h1>
							<Separator class="mt-2" />

							<div class="w-full flex flex-row flex-wrap justify-around text-center">
								<div>
									<p class="font-bold text-muted-foreground">Visits</p>
									<p>{formatCompactNumber(data.place.associatedgame.visits)}</p>
								</div>

								<div>
									<p class="font-bold text-muted-foreground">Created</p>
									<p>{data.place.created.toLocaleDateString('en-US')}</p>
								</div>

								<div>
									<p class="font-bold text-muted-foreground">Updated</p>
									<p>{relativeTime.from(data.place.updated)}</p>
								</div>

								<div>
									<p class="font-bold text-muted-foreground">Max Players</p>
									<p>{data.place.associatedgame.serversize}</p>
								</div>

								<div>
									<p class="font-bold text-muted-foreground">Genre</p>
									<p>{data.place.associatedgame.genre}</p>
								</div>

								<div>
									<p class="font-bold text-muted-foreground">Allowed Gear</p>
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
							<h1 class="text-2xl font-semibold">Servers</h1>
							<GameServers
								servers={data.servers}
								serverSize={data.place.associatedgame.serversize}
								placeid={data.place.placeid}
								ticket={data.ticket}
							/>
						</Tabs.Content>
					{/if}
				</Tabs.Root>
			</div>
		</div>

		<UserImage type="skyscraper" />
	</div>
</div>
