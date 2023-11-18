<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import * as Tabs from '$src/components/ui/tabs'

	import UserImage from '$src/components/userimage.svelte'

	import { Button } from '$src/components/ui/button'

	import { Play, ThumbsUp, ThumbsDown } from 'lucide-svelte'

	import { page } from '$app/stores'

	import type { PageData } from './$types'

	export let data: PageData

	function myGradient(gradientStart: string, gradientEnd: string) {
		return 'bg-gradient-to-b rofm-[' + gradientStart + '] to-[' + gradientEnd + ']'
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

					<Button
						variant="minimal"
						size="lg"
						class="w-full mx-auto mt-4 xl:mt-auto bg-success shadow-md hover:shadow-white flex gap-x-4"
					>
						<h1 class="text-xl">Play</h1>
						<Play className="h-4 w-full" />
					</Button>

					<div class="flex flex-row pt-4 px-4">
						<div class="text-success flex flex-row">
							<ThumbsUp />
						</div>
						<div class="w-full mx-4 flex flex-col">
							<div
								class="w-full h-3 bg-gradient-to-r from-success from-10% to-destructive to-0% rounded-xl"
							/>

							<div class="flex flex-row justify-between">
								<h1 class="text-success mx-4">0</h1>
								<h1 class="text-destructive mx-4">0</h1>
							</div>
						</div>
						<div class="text-destructive flex flex-row">
							<ThumbsDown />
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
						<div class="p-4">
							<h1 class="break-words text-xl whitespace-pre-line">
								{data.place.associatedgame.description}
							</h1>

							<div class="w-full flex flex-row justify-around text-center">
								<div>
									<p class="font-bold text-muted-foreground">Visits</p>
									<p>{data.place.associatedgame.visits}</p>
								</div>

								<div>
									<p class="font-bold text-muted-foreground">Created</p>
									<p>{data.place.created.toLocaleDateString('en-US')}</p>
								</div>

								<div>
									<p class="font-bold text-muted-foreground">Updated</p>
									<p>{data.place.updated.toLocaleDateString('en-US')}</p>
								</div>

								<div>
									<p class="font-bold text-muted-foreground">Max Players</p>
									<p>{data.place.associatedgame.serversize}</p>
								</div>

								<div>
									<p class="font-bold text-muted-foreground">Genre</p>
									<p>{data.place.associatedgame.genre}</p>
								</div>
							</div>
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>
		</div>

		<UserImage type="skyscraper" />
	</div>
</div>
