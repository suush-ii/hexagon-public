<script lang="ts">
	import Avatar from '$src/components/users/avatar.svelte'

	import * as AvatarThumb from '$src/components/ui/avatar'

	import * as Accordion from '$src/components/ui/accordion'

	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import { Button } from '$src/components/ui/button'

	import { page } from '$app/stores'

	import { stateTextMap } from '$lib/utils'

	import { Separator } from '$src/components/ui/separator'

	import RelativeTime from '@yaireo/relative-time'

	const relativeTime = new RelativeTime()

	import type { PageData } from './$types'

	export let data: PageData

	$: status = data.status

	$: userid = data.userid

	$: username = data.username

	$: textColor = stateTextMap[status]

	import { pageName } from '$src/stores'
	import { invalidateAll } from '$app/navigation'

	$: pageName.set(username)

	async function friend(friend: boolean) {
		await fetch(`/api/account/friend`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ recipientid: userid, type: friend === true ? 'friend' : 'unfriend' })
		})

		invalidateAll()
	}
</script>

<div class="container p-4 flex flex-col gap-y-4 pt-8">
	<div
		class="flex flex-row gap-x-4 bg-muted-foreground/5 p-6 rounded-xl outline-dashed outline-muted-foreground/20"
	>
		<Avatar state={status} {userid} {username} />

		<h1 class="font-semibold text-5xl">{username}</h1>

		{#if userid != data.user.userid}
			{#if data.relation.length > 0 && data.relation[0].type === 'block'}
				<Button variant="outline" class="ml-auto mt-auto h-14 w-40 text-lg" disabled size="lg"
					>Blocked</Button
				>
			{:else if data.relation.length > 0 && data.relation[0].type === 'friend'}
				<Button
					on:click={() => {
						friend(false)
					}}
					variant="outline"
					class="ml-auto mt-auto h-14 w-40 text-lg"
					size="lg">Unfriend</Button
				>
			{:else if data.relation.length > 0 && data.relation[0].type === 'request'}
				<Button variant="outline" class="ml-auto mt-auto h-14 w-40 text-lg" disabled size="lg"
					>Pending</Button
				>
			{:else}
				<Button
					on:click={() => {
						friend(true)
					}}
					variant="outline"
					class="ml-auto mt-auto h-14 w-40 text-lg"
					size="lg">Add Friend</Button
				>
			{/if}
		{/if}
	</div>

	<div class="flex flex-row h-full">
		<div class="w-1/2 flex flex-col gap-y-4 h-full">
			<Separator class="w-full" />
			<h1 class="text-3xl font-semibold tracking-tight">About {username}</h1>
			<div
				class="bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-6 gap-y-4 flex flex-col"
			>
				<div class="mx-auto flex flex-col">
					{#if status == 'online'}
						<h1 class="text-lg {textColor} mx-auto">[ Online: Website ]</h1>
					{:else if status == 'offline'}
						<h1 class="text-lg {textColor} mx-auto">[ Offline ]</h1>
					{:else if status == 'game'}
						<h1 class="text-lg {textColor} mx-auto hover:underline">
							[ Online: <a href="/games/{data.activegame?.placeid}"
								>{data.activegame?.associatedgame.gamename}</a
							> ]
						</h1>
					{:else if status == 'studio'}
						<h1 class="text-lg {textColor} mx-auto">[ Online: Studio ]</h1>
					{/if}
					<h1 class="text-lg {textColor} mx-auto hover:underline">
						<a href={$page.url.toString()}>{$page.url}</a>
					</h1>
				</div>

				<Avatar
					state={status}
					{userid}
					{username}
					css={'xl:h-80 h-fit w-full max-w-80 aspect-square'}
					type="avatar"
				/>

				<p class="mx-auto line-clamp-6 break-words">Hi!</p>

				<Separator class="mt-2" />

				<div class="w-full flex flex-row flex-wrap justify-around text-center">
					<div>
						<p class="font-bold text-muted-foreground">Join Date</p>
						<p>{data.joindate.toLocaleDateString('en-US')}</p>
					</div>

					<div>
						<p class="font-bold text-muted-foreground">Last Online</p>
						{#if new Date().valueOf() - new Date(data.lastactivetime).valueOf() < 3 * 60 * 1000}
							<p>Now</p>
							<!--Less than 3 mins ago-->
						{:else}
							<p>{relativeTime.from(data.lastactivetime)}</p>
						{/if}
					</div>

					<div>
						<p class="font-bold text-muted-foreground">Place Visits</p>
						<p>{data.placeVisits}</p>
					</div>
				</div>

				<Separator class="mt-2" />
			</div>

			<Separator class="w-full" />
			<div />
		</div>

		<Separator orientation="vertical" class="h-full mx-4" />

		<div class="w-1/2 flex flex-col gap-y-4 h-full">
			<Separator class="w-full" />
			<h1 class="text-3xl font-semibold tracking-tight">Active Places</h1>
			<div
				class="h-full bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-4 flex flex-col"
			>
				<Accordion.Root class="w-full mb-auto">
					{#each data.places as place, i}
						<Accordion.Item value="item-{i}">
							<Accordion.Trigger>{place.gamename}</Accordion.Trigger>
							<Accordion.Content class="p-4">
								<div class="space-y-2">
									<h1 class="text-base">Visited {place.visits} times</h1>
									<a href="/games/{place.places?.[0].placeid}">
										<AvatarThumb.Root class="h-fit w-full rounded-xl aspect-video">
											<AvatarThumb.Image
												src={place.thumbnailurl
													? place.thumbnailurl
													: '/Images/thumbnailplaceholder.png'}
												alt={place.gamename}
												loading="lazy"
											/>
											<AvatarThumb.Fallback />
										</AvatarThumb.Root>
									</a>
									<p class="text-base leading-relaxed tracking-tight max-h-32 overflow-y-auto">
										{place.description}
									</p>
								</div>
							</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>

				<PaginationWrapper count={data.placeCount} size={40} url={$page.url} queryName={'places'} />
			</div>

			<h1 class="text-3xl font-semibold tracking-tight">{username}'s Friends!</h1>

			<div
				class="h-full bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl"
			/>

			<Separator class="w-full" />
		</div>
	</div>
</div>
